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

/**
 * Operações da blockchain.
 */
export class Blockchain {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        if (!IO.createDirectiry(coin.directory))
            throw new InvalidArgumentError('Blockchain initial directory canot be created.');

        Logger.post('Initializing Blockchain for coin "{0}" at: {1}', [coin.id, coin.directory], LogLevel.Information, LogContext.Blockchain);
        this.gitHumanMiner = this.initializeBranch(this.gitBranchHumanMiner);
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
            if (!git.checkout(branch) || !git.push()) {
                throwError('Error on update remote repository: {0}');
            }
        } else if (!git.checkout(branch)) {
            throwError('Error on checkout branch: {0}');
        }

        if (!git.pull()) {
            throwError('Error on update local repository: {0}');
        }

        return git;
    }
}
