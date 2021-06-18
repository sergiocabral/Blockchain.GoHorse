import path from "path";
import fs from "fs";
import {CoinModel} from "../../Model/CoinModel";
import {InvalidArgumentError} from "../../../../Errors/InvalidArgumentError";
import {IO} from "../../../../Helper/IO";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {Logger} from "../../../../Log/Logger";
import {LogLevel} from "../../../../Log/LogLevel";
import {LogContext} from "../../../../Log/LogContext";
import {Git} from "../../../../Process/Git";
import {Definition} from "../Definition";
import {CommitModel} from "../../../../Process/Model/CommitModel";
import {performance} from "perf_hooks";
import {MinerInfoModel} from "./MinerInfoModel";
import {StaleAction} from "./StaleAction";
import {CommitDateMode} from "./CommitDateMode";

/**
 * Operações da blockchain.
 */
export class Miner {
    /**
     * Construtor.
     * @param coin Moeda.
     * @param callbackWhenInitialized Chamada quando a blockchain está pronta para funcionar.
     */
    public constructor(private coin: CoinModel, private callbackWhenInitialized: () => void) {
        Logger.post('Initializing Blockchain for coin "{coin}" at: {directory}', {coin: coin.id, directory: coin.directory}, LogLevel.Information, LogContext.BlockchainMiner);
        this.git = Miner.initializeRepository(coin);
        this.updateRepository();

        const firstBlock = this.git.getCommitContent(Definition.FirstBlock);
        if (!firstBlock) throw new InvalidExecutionError("First block not found.");
        this.firstBlock = firstBlock;

        const currentCommit = this.git.getCommit();
        if (!currentCommit) throw new InvalidExecutionError("Current commit not found.");
        const currentCommitContent = this.git.getCommitContent(currentCommit);
        if (!currentCommitContent) throw new InvalidExecutionError("Current commit cannot be read.");
        this.lastBlock = currentCommitContent;

        this.initialize();
    }

    /**
     * Diretório da blockchain.
     */
    public get directory(): string {
        return this.git.directory;
    }

    /**
     * Estado da inicialização da classe.
     */
    private initializedValue: boolean = false;

    /**
     * Estado da inicialização da classe.
     */
    public get initialized(): boolean {
        return this.initializedValue;
    }

    /**
     * Sinaliza execução em andamento.
     * @private
     */
    private commitInProgressState: boolean = false;

    /**
     * Manipulador do Git.
     * @private
     */
    private git: Git;

    /**
     * Informações do primeiro bloco de commit.
     * @private
     */
    public readonly firstBlock: CommitModel;

    /**
     * Informações do último bloco de commit minerado.
     * @private
     */
    public lastBlock: CommitModel;

    /**
     * Inicializa a blockchain.
     * @private
     */
    private initialize(): void {
        const initialized: Promise<boolean>[] = []
        const previousCommitHash = this.git.getCommit(1);
        const levelsWithoutFirstBlock = Definition.LinkLevel - 1;
        if (previousCommitHash === null) {
            this.git.reset();
            IO.removeAll(this.git.directory, '.git');
            this.git.add("--all");
            for (let level = 1; level <= levelsWithoutFirstBlock; level++) {
                initialized.push(
                    this.queueToMiner(
                        StaleAction.Stop,
                        'Blockchain base with strongly linked commits. Level {0} of {1}.'.querystring([level, levelsWithoutFirstBlock]),
                        level,
                        CommitDateMode.LastBlockIncrement));
            }
        } else {
            for (let parentIndex = 1; parentIndex <= levelsWithoutFirstBlock; parentIndex++) {
                const hash = this.git.getCommit(parentIndex);
                if (hash === null) {
                    Logger.post('Cannot go to parent commit HEAD~{parentIndex}.', {parentIndex}, LogLevel.Error, LogContext.BlockchainMiner);
                    throw new InvalidExecutionError('Cannot go to parent commit HEAD~{0}.'.querystring(parentIndex));
                }
            }

            initialized.push(new Promise(resolve => resolve(true)));
        }

        Promise.all(initialized).then(values => {
            if (!values.includes(false)) {
                this.initializedValue = true;
                this.callbackWhenInitialized();
            }
        });
    }

    /**
     * Sinaliza execução em andamento.
     * @param inProgress Sim ou não para execução em andamento.
     * @private
     */
    private commitInProgress(inProgress: boolean = true): void {
        if (inProgress && this.commitInProgressState) {
            Logger.post('Commit in progress.', undefined, LogLevel.Error, LogContext.BlockchainMiner);
            throw new InvalidExecutionError('Commit in progress');
        }
        this.commitInProgressState = inProgress;
    }

    /**
     * Faz uma trasação entrar no bloco.
     * @param message Mensagem do bloco
     * @private
     */
    public async commit(message: string): Promise<boolean> {
        this.commitInProgress();
        this.git.add('--all');
        const success = await this.queueToMiner(StaleAction.Stop, message);
        this.commitInProgress(false);
        return success;
    }

    /**
     * Fila de commits pendentes de mineração.
     * @private
     */
    private readonly queueToMinerList: MinerInfoModel[] = [];

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

            this.minerInProgress = Boolean(minerInfo = this.queueToMinerList.shift());
            if (!minerInfo) {
                this.git.gc();
                return;
            }

            minerInfo.startTime = performance.now();
            minerInfo.parentCommitHash = this.getParentsCommits(minerInfo.linkLevel);
            Logger.post("Starting block mining. Tree: {tree}. Message: {message}", {tree: minerInfo.treeHash, message: minerInfo.messageFirstLine}, LogLevel.Information, LogContext.BlockchainMiner);
        }

        process.env.GIT_AUTHOR_NAME = process.env.GIT_COMMITTER_NAME = this.firstBlock.committerName;
        process.env.GIT_AUTHOR_EMAIL = process.env.GIT_COMMITTER_EMAIL = this.firstBlock.committerEmail;
        process.env.GIT_AUTHOR_DATE = this.factoryGitDateString(minerInfo.dateMode);

        const elapsedSeconds = Math.round((performance.now() - minerInfo.startTime) / 1000);
        const message = minerInfo.factoryMessage(`Mining difficulty: ${Definition.ComputerMinerDifficult}. Elapsed time: ${elapsedSeconds} seconds. Block mined by: ${this.coin.instanceName}`);
        const minedCommit = this.git.commitTree(message, minerInfo.parentCommitHash, minerInfo.treeHash);

        if (minedCommit === null) throw new InvalidExecutionError("Commit failed: " + this.git.lastOutput);

        if (this.isValidHash(minedCommit)) {

            this.git.reset(true, minedCommit);

            if (this.git.push()) {
                Logger.post("Block mining COMPLETED. Tree: {tree}. Hash: {commit}. Difficulty: {difficulty}. Elapsed time: {elapsedSeconds} seconds. Message: {message}", {
                    tree: minerInfo.treeHash,
                    commit: minedCommit,
                    difficulty: Definition.ComputerMinerDifficult,
                    elapsedSeconds,
                    message: minerInfo.messageFirstLine}, LogLevel.Information, LogContext.BlockchainMiner);

                minerInfo.callbackWhenFinished(true);

                const minedCommitContent = this.git.getCommitContent(minedCommit);
                if (!minedCommitContent) throw new InvalidExecutionError("Last commit cannot be read.");
                this.lastBlock = minedCommitContent;
            } else {
                Logger.post("Block mining STALED. Tree: {tree}. Hash: {commit}. Difficulty: {difficulty}. Elapsed time: {elapsedSeconds} seconds. Message: {message}", {
                    tree: minerInfo.treeHash,
                    commit: minedCommit,
                    difficulty: Definition.ComputerMinerDifficult,
                    elapsedSeconds,
                    message: minerInfo.messageFirstLine
                }, LogLevel.Information, LogContext.BlockchainMiner);

                this.updateRepository();
                const currentCommitHash = this.git.getCommit();
                Logger.post("Block mining staled because there was already a more recent commit: {commit}. Action after stale: {slateAction}", {commit: currentCommitHash, slateAction: StaleAction[minerInfo.staleAction]}, LogLevel.Warning, LogContext.BlockchainMiner);

                switch (minerInfo.staleAction) {
                    case StaleAction.Stop:
                        Logger.post("Total pending blocks that will be dropped: {count}", {count: this.queueToMinerList.length}, LogLevel.Warning, LogContext.BlockchainMiner);
                        minerInfo.callbackWhenFinished(false);
                        while (this.queueToMinerList.length) {
                            this.queueToMinerList.pop()?.callbackWhenFinished(false);
                        }
                        break;
                    case StaleAction.Retry:
                        Logger.post("Retrying to mine this block. Tree: {tree}.", {tree: minerInfo.treeHash}, LogLevel.Information, LogContext.BlockchainMiner);
                        this.queueToMinerList.unshift(minerInfo);
                        break;
                    case StaleAction.Discard:
                    default:
                        Logger.post("Dropping this block. Tree: {tree}.", { tree: minerInfo.treeHash }, LogLevel.Information, LogContext.BlockchainMiner);
                        minerInfo.callbackWhenFinished(false);
                        break;
                }
            }

            minerInfo = null;
            this.minerInProgress = false;
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
     * @param staleAction Ação para o caso da mineração falhar.
     * @param message Mensagem do commit.
     * @param linkLevel Nível de link com os commits anteiores e o first-block. Define null para usar o padrão.
     * @param dateMode Modos de definir a data do commit (bloco) atual.
     */
    private queueToMiner(staleAction: StaleAction, message?: string, linkLevel?: number, dateMode: CommitDateMode = CommitDateMode.CurrentDate): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.queueToMinerList.push(
                new MinerInfoModel(
                    this.git.writeTree(),
                    message,
                    linkLevel,
                    dateMode,
                    staleAction,
                    success => resolve(success)));
            this.miner();
        })
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
            Logger.post('Git is not installed.', undefined, LogLevel.Error, LogContext.BlockchainMiner);
            throw new InvalidExecutionError('Git is not installed');
        }

        if (!IO.createDirectory(coin.directory)) {
            Logger.post('Blockchain initial directory cannot be created: {directory}', { directory: coin.directory }, LogLevel.Error, LogContext.BlockchainMiner);
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

    /**
     * Constrois a string de data do git conforme o modo especificado.
     * @param mode
     * @param source Origem da data.
     * @private
     */
    private factoryGitDateString(mode: CommitDateMode, source: 'author' | 'committer' = 'committer') {
        const isAuthor = source === 'author';
        switch (mode) {
            case CommitDateMode.CurrentDate:
                return "";
            case CommitDateMode.FirstBlock:
                return isAuthor ? this.firstBlock.authorDate : this.firstBlock.committerDate;
            case CommitDateMode.LastBlock:
                return isAuthor ? this.lastBlock.authorDate : this.lastBlock.committerDate;
            case CommitDateMode.LastBlockIncrement:
                return Git.incrementDate(isAuthor ? this.lastBlock.authorDate : this.lastBlock.committerDate);
            default:
                throw new InvalidArgumentError("Date mode is not valid.");
        }
    }
}
