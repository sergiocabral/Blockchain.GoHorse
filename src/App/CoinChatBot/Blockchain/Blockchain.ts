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
        this.database = new Database(this.git.directory, this.commitTransaction.bind(this));
        this.database.initialize();
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
     * Faz uma trasação entrar no bloco.
     * @private
     */
    private commitTransaction(): void {
        this.workingInProgress();

        this.git.add('--all');
        this.git.commit('Ops! ' + (new Date()).getTime());

        this.workingInProgress(false);
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

        const branchName = Definition.BranchName.querystring({coin: coin.id});
        const finalDirectory = path.resolve(coin.directory, branchName);
        const alreadyCloned = fs.existsSync(finalDirectory);

        const git = new Git(alreadyCloned ? finalDirectory : coin.directory);

        if (!alreadyCloned) {
            git.clone(coin.repository, finalDirectory, Definition.EmptyBranchName);
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
