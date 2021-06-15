import {CoinModel} from "./Model/CoinModel";
import {InvalidArgumentError} from "../../Errors/InvalidArgumentError";
import {IO} from "../../Helper/IO";
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
        if (!IO.createDirectory(coin.directory))
            throw new InvalidArgumentError('Blockchain initial directory cannot be created.');

        Logger.post('Initializing Blockchain for coin "{0}" at: {1}', [coin.id, coin.directory], LogLevel.Information, LogContext.Blockchain);

        //TODO: Fazer clone do repositório (blockchain) + prepaprar estrutura inicial + push + etc.
    }
    /**
     * Sinaliza execução em andamento.
     * @private
     */
    private static workingInProgressState: boolean = false;

    /**
     * Sinaliza execução em andamento.
     * @param inProgress Sim ou não para execução em andamento.
     * @private
     */
    private static workingInProgress(inProgress: boolean = true): void {
        if (inProgress && Blockchain.workingInProgressState) {
            throw new InvalidExecutionError('Blockchain: Working in progress');
        }
        Blockchain.workingInProgressState = inProgress;
    }
}
