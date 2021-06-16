import path from "path";
import fs from "fs";
import {CoinModel} from "../Model/CoinModel";
import {InvalidArgumentError} from "../../../Errors/InvalidArgumentError";
import {IO} from "../../../Helper/IO";
import {InvalidExecutionError} from "../../../Errors/InvalidExecutionError";
import {Logger} from "../../../Log/Logger";
import {LogLevel} from "../../../Log/LogLevel";
import {LogContext} from "../../../Log/LogContext";
import {Git} from "../../../Process/Git";
import {Definition} from "./Definition";
import {Database} from "./Database";
import {CommitModel} from "../../../Process/Model/CommitModel";
import {performance} from "perf_hooks";
import {MinerInfoModel} from "./Model/MinerInfoModel";

/**
 * Operações da blockchain.
 */
export class Blockchain {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        Logger.post('Initializing Blockchain for coin "{0}" at: {1}', [coin.id, coin.directory], LogLevel.Information, LogContext.Blockchain);
        this.git = Blockchain.initializeRepository(coin);
        this.updateRepository();

        const firstBlock = this.git.getCommitContent(Definition.FirstBlock);
        if (firstBlock === null) throw new InvalidExecutionError("First block not found.");
        this.firstBlock = firstBlock;

        this.initialize();
        this.database = new Database(this.git.directory, this.commitTransaction.bind(this));
    }

    /**
     * Sinaliza execução em andamento.
     * @private
     */
    private workingInProgressState: boolean = false;

    /**
     * Manipulador do Git.
     * @private
     */
    private git: Git;

    /**
     * Informações do primeiro bloco de commit.
     * @private
     */
    private firstBlock: CommitModel;

    /**
     * Banco de dados com as informações da moeda.
     * @private
     */
    private database: Database;

    /**
     * Sinaliza execução em andamento.
     * @param inProgress Sim ou não para execução em andamento.
     * @private
     */
    private workingInProgress(inProgress: boolean = true): void {
        if (inProgress && this.workingInProgressState) {
            Logger.post('Blockchain: Working in progress.', undefined, LogLevel.Error, LogContext.Blockchain);
            throw new InvalidExecutionError('Blockchain: Working in progress');
        }
        this.workingInProgressState = inProgress;
    }

    /**
     * Inicializa a blockchain.
     * @private
     */
    private initialize(): void {
        const previousCommitHash = this.git.getCommit(1);
        const levels = Definition.LinkLevel - 1;
        if (previousCommitHash === null) {
            this.git.reset();
            IO.removeAll(this.git.directory, '.git');
            this.git.add("--all");
            for (let level = 1; level <= levels; level++) {
                this.createLinkedCommit('Blockchain base with strongly linked commits. Level {0} of {1}.'.querystring([level, levels]), level, false);
            }
        } else {
            for (let parentIndex = 1; parentIndex <= levels; parentIndex++) {
                const hash = this.git.getCommit(parentIndex);
                if (hash === null) {
                    Logger.post('Cannot go to parent commit HEAD~{0}.', parentIndex, LogLevel.Error, LogContext.Blockchain);
                    throw new InvalidExecutionError('Cannot go to parent commit HEAD~{0}.'.querystring(parentIndex));
                }
            }
        }
    }

    /**
     * Faz uma trasação entrar no bloco.
     * @param message Mensagem do bloco
     * @private
     */
    private commitTransaction(message: string): void {
        this.workingInProgress();

        this.git.add('--all');

        this.createLinkedCommit(message);

        this.workingInProgress(false);
    }

    /**
     * Fila de commits pendentes de mineração.
     * @private
     */
    private readonly queueLinkedCommit: MinerInfoModel[] = [];

    /**
     * Sinaliza que o processo de mineração está em andamento.
     * @private
     */
    private minerInProgress: boolean = false;

    /**
     * Inicia o processo de mineração.
     * @private
     * @param minerInfo Informações de mineração.
     */
    private miner(minerInfo: MinerInfoModel | null | undefined = null): void {
        if (!minerInfo) {
            if (this.minerInProgress) return;

            this.minerInProgress = Boolean(minerInfo = this.queueLinkedCommit.shift());
            if (!minerInfo) {
                this.git.gc();
                return;
            }

            minerInfo.startTime = performance.now();
            minerInfo.parentCommitHash = this.getParentsCommits(minerInfo.linkLevel);
            Logger.post("Starting block mining. Tree: {0}. Message: {1}", [minerInfo.treeHash, minerInfo.messageFirstLine], LogLevel.Information, LogContext.Blockchain);
        }

        process.env.GIT_AUTHOR_NAME = process.env.GIT_COMMITTER_NAME = this.firstBlock.committerName;
        process.env.GIT_AUTHOR_EMAIL = process.env.GIT_COMMITTER_EMAIL = this.firstBlock.committerEmail;
        process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = minerInfo.useCurrentDate ? "" : this.firstBlock.committerDate;

        const elapsedSeconds = Math.round((performance.now() - minerInfo.startTime) / 1000);
        const message = minerInfo.factoryMessage(`Mining difficulty: ${Definition.ComputerMinerDifficult}. Elapsed time: ${elapsedSeconds} seconds. Block mined by: ${this.coin.instanceName}`);
        const minedCommit = this.git.commitTree(message, minerInfo.parentCommitHash, minerInfo.treeHash);

        if (minedCommit === null) throw new InvalidExecutionError("Commit failed: " + this.git.lastOutput);

        if (this.isValidHash(minedCommit)) {
            this.git.reset(true, minedCommit);
            if (this.git.push()) {
                Logger.post("Block mining COMPLETED. Tree: {0}. Hash: {1}. Difficulty: {2}. Elapsed time: {3} seconds. Message: {4}", [minerInfo.treeHash, minedCommit, Definition.ComputerMinerDifficult, elapsedSeconds, minerInfo.messageFirstLine], LogLevel.Information, LogContext.Blockchain);
            } else {
                Logger.post("Block mining STALED. Tree: {0}. Hash: {1}. Difficulty: {2}. Elapsed time: {3} seconds. Message: {4}", [minerInfo.treeHash, minedCommit, Definition.ComputerMinerDifficult, elapsedSeconds, minerInfo.messageFirstLine], LogLevel.Information, LogContext.Blockchain);
                this.updateRepository();
                //TODO: Verificar como determinar se minera novamente o bloco
            }
            this.minerInProgress = Boolean(minerInfo = null);
        }

        setImmediate(() => this.miner(minerInfo));
    }

    /**
     * Monta a lista de hash dos commits anteriores.
     * @param linkLevel
     * @private
     */
    private getParentsCommits(linkLevel: number): string[] {
        const getCommit = (parent: number|string = 0): string => {
            const commitHash = this.git.getCommit(parent);
            if (commitHash === null) throw new InvalidExecutionError("Commit not found.");
            return commitHash;
        }

        const currentCommitHash = getCommit();
        const result = [currentCommitHash];

        for (let parentIndex = 1; parentIndex <= linkLevel - 1; parentIndex++) {
            const commitHash = getCommit(parentIndex);
            result.push(commitHash);
        }

        if (this.firstBlock.hash !== result[result.length - 1]) {
            result.push(this.firstBlock.hash);
        }

        return result;
    }

    /**
     * Cria um commit linkado com os anteriores.
     * @private
     * @param message Mensagem do commit.
     * @param linkLevel Nível de link com os commits anteiores e o first-block. Define null para usar o padrão.
     * @param currentDate Utiliza data corrente. Do contrário usa a data do primeiro commit.
     */
    private createLinkedCommit(message?: string, linkLevel?: number, currentDate: boolean = true) {
        const treeHash = this.git.writeTree();
        this.queueLinkedCommit.push(new MinerInfoModel(treeHash, message, linkLevel, currentDate));
        this.miner();
    }

    /**
     * Valida se um hash é válido para a blockchain.
     * @param hash
     * @private
     */
    private isValidHash(hash: string): boolean {
        const start = this.firstBlock.hash.substr(0, Definition.ComputerMinerDifficult);
        return hash.startsWith(start);
    }

    /**
     * Faz as validações iniciais antes de inicializar o repositório do Git.
     * @param coin Dados da moeda.
     * @private
     */
    private static initialValidate(coin: CoinModel): void {
        if (!Git.isInstalled) {
            Logger.post('Git is not installed.', undefined, LogLevel.Error, LogContext.Blockchain);
            throw new InvalidExecutionError('Git is not installed');
        }

        if (!IO.createDirectory(coin.directory)) {
            Logger.post('Blockchain initial directory cannot be created: {0}', coin.directory, LogLevel.Error, LogContext.Blockchain);
            throw new InvalidArgumentError('Blockchain initial directory cannot be created: {0}'.querystring(coin.directory));
        }
    }

    /**
     * Inicializa o diretório local com o repositório do Git.
     * @private
     * @param coin Dados da moeda.
     */
    private static initializeRepository(coin: CoinModel): Git {
        this.initialValidate(coin);

        const branchName = Definition.Branch.querystring({coin: coin.id});
        const finalDirectory = path.resolve(coin.directory, branchName);
        const alreadyCloned = fs.existsSync(finalDirectory);

        const git = new Git(alreadyCloned ? finalDirectory : coin.directory);

        if (!alreadyCloned) {
            git.clone(coin.repository, finalDirectory, Definition.FirstBlock);
        }
        git.checkout(branchName);

        return git;
    }

    /**
     * Atualiz ao repositório atual com os dados remotos.
     * @private
     */
    private updateRepository() {
        const branchName = this.git.getCurrentBranch();
        const check =
            this.git.reset() &&
            this.git.clean() &&
            this.git.fetch(branchName) &&
            this.git.checkout(branchName) &&
            this.git.reset(true, "FETCH_HEAD");
        if (!check) throw new InvalidExecutionError("Error when synchronize repository: " + this.git.lastOutput);
    }
}
