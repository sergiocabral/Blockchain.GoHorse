import {CoinModel} from "../Model/CoinModel";
import {Database} from "./Database/Database";
import {Miner} from "./Miner/Miner";
import {InvalidExecutionError} from "../../../Errors/InvalidExecutionError";
import {Definition} from "./Definition";

/**
 * Responsável por enfileirar comandos para operar a moeda.
 */
export class CoinCommandQueue {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        this.miner = new Miner(coin, this.minerInitialized.bind(this));
        this.database = new Database(coin, this.miner.directory);
    }

    /**
     * Operações da blockchain
     * @private
     */
    private readonly miner: Miner;

    /**
     * Banco de dados com as informações da moeda.
     * @private
     */
    private readonly database: Database;

    /**
     * Inicialização da classe.
     * @private
     */
    private async minerInitialized() {
        if (!this.miner.initialized) throw new InvalidExecutionError("Blockchain is not initialized.");

        const newVersion = this.database.updateStructure();
        if (newVersion) {
            await this.miner.commit(
                "Directories and files structure updated for version: {0}.{1}."
                    .querystring([Definition.MajorVersion, newVersion]));
        }
    }
}
