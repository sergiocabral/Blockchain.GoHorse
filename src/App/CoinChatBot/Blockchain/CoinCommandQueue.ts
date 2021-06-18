import {CoinModel} from "../Model/CoinModel";
import {Database} from "./Database";
import {Blockchain} from "./Blockchain";
import {Text} from "../../../Helper/Text";
import {InvalidExecutionError} from "../../../Errors/InvalidExecutionError";

/**
 * Responsável por enfileirar comandos para operar a moeda.
 */
export class CoinCommandQueue {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        this.blockchain = new Blockchain(coin, this.blockchainInitialized.bind(this));
        this.database = new Database(this.blockchain.directory);
    }

    /**
     * Operações da blockchain
     * @private
     */
    private readonly blockchain: Blockchain;

    /**
     * Banco de dados com as informações da moeda.
     * @private
     */
    private readonly database: Database;

    /**
     * Inicialização da classe.
     * @private
     */
    private async blockchainInitialized() {
        if (!this.blockchain.initialized) throw new InvalidExecutionError("Blockchain is not initialized.");

        if (this.database.updateStructure()) {
            await this.blockchain.commit(
                "Directories and files structure updated for version: {0}."
                    .querystring(this.database.structureVersion));
        }
    }
}
