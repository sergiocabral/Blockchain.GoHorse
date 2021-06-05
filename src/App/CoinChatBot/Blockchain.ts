import {Git} from "../../Process/Git";
import {CoinModel} from "./Model/CoinModel";
import {InvalidArgumentError} from "../../Errors/InvalidArgumentError";
import {IO} from "../../Helper/IO";
import path from "path";
import fs from "fs";
import {InvalidExecutionError} from "../../Errors/InvalidExecutionError";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {Message} from "../../Bus/Message";
import {PutHumanProblemIntoBlockchainCommand} from "./MessageCommand/PutHumanProblemIntoBlockchainCommand";
import {GetHumanProblemFromBlockchainCommand} from "./MessageCommand/GetHumanProblemFromBlockchainCommand";
import {HumanProblem} from "./HumanProblem";

/**
 * Operações da blockchain.
 */
export class Blockchain {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        if (!IO.createDirectory(coin.directory))
            throw new InvalidArgumentError('Blockchain initial directory canot be created.');

        Logger.post('Initializing Blockchain for coin "{0}" at: {1}', [coin.id, coin.directory], LogLevel.Information, LogContext.Blockchain);
        this.gitHumanMiner = this.initializeBranch(this.gitBranchHumanMiner);

        Message.capture(PutHumanProblemIntoBlockchainCommand, this, this.hanlderPutHumanProblemIntoBlockchainCommand);
        Message.capture(GetHumanProblemFromBlockchainCommand, this, this.hanlderGetHumanProblemFromBlockchainCommand);
    }

    /**
     * Branch vazio.
     * @private
     */
    private readonly gitBranchEmpty: string = 'first-block';

    /**
     * Branch para o HumanMiner
     * @private
     */
    private get gitBranchHumanMiner(): string {
        return `coin-${this.coin.id}-human-miner`;
    }

    /**
     * Nome do arquivo da mineração humana.
     * @private
     */
    private humanMinerFileName: string = "last-human-problem.txt";

    /**
     * Git branch: human-miner
     * @private
     */
    private gitHumanMiner: Git;

    public initializeBranch(branch: string): Git {
        const repositoryDirectory = path.resolve(this.coin.directory, branch);
        const repositoryExists = fs.existsSync(repositoryDirectory);
        const git = new Git(
            repositoryExists
                ? repositoryDirectory
                : this.coin.directory);

        const throwError = (message: string) => {
            Logger.post(message, git.lastOutput, LogLevel.Error, LogContext.Blockchain);
            throw new InvalidExecutionError(message.querystring(git.lastOutput));
        }

        if (!repositoryExists) {
            if (!git.clone(this.coin.repository, branch, this.gitBranchEmpty)) {
                throwError('Error when clone repository: {0}');
            }
        } else {
            if (!git.reset() || !git.clean()) {
                throwError('Error when reset and clean repository: {0}');
            }
        }

        if (!git.branchExists(branch)) {
            if (!git.checkout(branch)) {
                throwError('Error on checkout branch: {0}');
            }
            if (!git.push()) {
                throwError('Error on update remote repository: {0}');
            }
        } else if (!git.checkout(branch, 'FETCH_HEAD')) {
            throwError('Error on checkout branch: {0}');
        }

        if (!git.emptyDirectory([this.humanMinerFileName]) || !git.push()) {
            throwError('Error on clean repository directory: {0}');
        }

        if (!git.pull()) {
            throwError('Error on update local repository: {0}');
        }

        return git;
    }

    /**
     * Processador de mensagem.
     * @param message PutHumanProblemIntoBlockchainCommand
     * @private
     */
    private hanlderPutHumanProblemIntoBlockchainCommand(message: PutHumanProblemIntoBlockchainCommand): void {
        const content = message.problem.asText();
        const filePath = path.resolve(this.gitHumanMiner.directory, this.humanMinerFileName);
        fs.writeFileSync(filePath, Buffer.from(content));
        const hash =
            this.gitHumanMiner.reset() &&
            this.gitHumanMiner.add(this.humanMinerFileName) &&
            this.gitHumanMiner.commit('Human problem created by miner: {0}'.querystring(this.coin.instanceName)) &&
            this.gitHumanMiner.push() &&
            this.gitHumanMiner.currentCommit();
        if (!hash) throw new InvalidExecutionError('Fail when commit human problem.');
        message.hash = hash;
        message.url = `${this.coin.repositoryUrl}/commit/${hash}`;
    }

    /**
     * Processador de mensagem.
     * @param message GetHumanProblemFromBlockchainCommand
     * @private
     */
    private hanlderGetHumanProblemFromBlockchainCommand(message: GetHumanProblemFromBlockchainCommand): void {
        const hash =
            this.gitHumanMiner.reset() &&
            this.gitHumanMiner.pull() &&
            this.gitHumanMiner.currentCommit();

        if (!hash) throw new InvalidExecutionError('Cannot clean the repository.');

        const filePath = path.resolve(this.gitHumanMiner.directory, this.humanMinerFileName);
        if (!fs.existsSync(filePath)) {
            message.problem = null;
            return;
        }

        const content = fs.readFileSync(filePath).toString();
        message.problem = HumanProblem.factory(content);
        message.hash = hash;
        message.url = `${this.coin.repositoryUrl}/commit/${hash}`;
    }
}
