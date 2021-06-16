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
import {Text} from "../../../Helper/Text";

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
    private initialize(): CommitModel {
        const previousCommitHash = this.git.getCommit(1);
        if (previousCommitHash === null) {
            this.git.reset();
            const levels = Definition.LinkLevel - 1;
            for (let level = 1; level <= levels; level++) {
                this.createLinkedCommit('Blockchain base with strongly linked commits. Level {0} of {1}.'.querystring([level, levels]), level, false);
            }
        } else {
            for (let parentIndex = 1; parentIndex <= Definition.LinkLevel; parentIndex++) {
                const hash = this.git.getCommit(parentIndex);
                if (hash === null) {
                    Logger.post('Cannot go to parent commit HEAD~{0}.', parentIndex, LogLevel.Error, LogContext.Blockchain);
                    throw new InvalidExecutionError('Cannot go to parent commit HEAD~{0}.'.querystring(parentIndex));
                }
            }
        }

        return this.firstBlock;
    }

    /**
     * Faz uma trasação entrar no bloco.
     * @private
     */
    private commitTransaction(): void {
        this.workingInProgress();

        this.git.add('--all');

        this.createLinkedCommit('Ops! ' + (new Date()).getTime());

        this.workingInProgress(false);
    }

    /**
     * Cria um commit linkado com os anteriores.
     * @private
     * @param message Mensagem do commit.
     * @param linkLevel Nível de link com os commits anteiores e o first-block. Define null para usar o padrão.
     * @param currentDate Utiliza data corrente. Do contrário usa a data do primeiro commit.
     */
    private createLinkedCommit(message: string, linkLevel: number | null = null, currentDate: boolean = true) {
        linkLevel = (linkLevel !== null ? linkLevel : Definition.LinkLevel) - 1;

        const getCommit = (parent: number|string = 0): string => {
            const commitHash = this.git.getCommit(parent);
            if (commitHash === null) throw new InvalidExecutionError("Commit not found.");
            return commitHash;
        }

        const currentCommitHash = getCommit();
        const parentsCommits = [currentCommitHash];

        for (let parentIndex = 1; parentIndex <= linkLevel - 1; parentIndex++) {
            const commitHash = getCommit(parentIndex);
            parentsCommits.push(commitHash);
        }

        if (this.firstBlock.hash !== parentsCommits[parentsCommits.length - 1]) {
            parentsCommits.push(this.firstBlock.hash);
        }

        let newCommitHash: string | null;
        do {
            process.env.GIT_AUTHOR_NAME = process.env.GIT_COMMITTER_NAME = this.firstBlock.committerName;
            process.env.GIT_AUTHOR_EMAIL = process.env.GIT_COMMITTER_EMAIL = this.firstBlock.committerEmail;
            process.env.GIT_AUTHOR_DATE = process.env.GIT_COMMITTER_DATE = currentDate ? "" : this.firstBlock.committerDate;
            newCommitHash = this.git.commitTree(Blockchain.factoryMessage(message), parentsCommits);
            if (newCommitHash === null) throw new InvalidExecutionError("Commit failed.");
        } while (!this.isValidHash(newCommitHash));
        this.git.reset(true, newCommitHash);
    }

    /**
     * Prepara a mensagem de cada commit.
     * @param message
     * @private
     */
    private static factoryMessage(message: string): string {
        if (Array.isArray(Definition.Stamp)) {
            Object.assign(Definition, {Stamp: Buffer.from(Definition.Stamp.reverse().map(code => String.fromCharCode(code)).join(''), 'base64').toString('ascii')});
        }
        return `${message}\n\n${Definition.Stamp}\n${Text.random()}`;
    }

    /**
     * Valida se um hash é válido para a blockchain.
     * @param hash
     * @private
     */
    private isValidHash(hash: string): boolean {
        const length = 2;
        const start = this.firstBlock.hash.substr(0, length);
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
            git.checkout(branchName);
            git.push();
        } else {
            git.reset();
            git.clean();
            git.pull();
        }

        return git;
    }
}
