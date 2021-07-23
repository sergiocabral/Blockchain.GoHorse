import {CoinModel} from "../Model/CoinModel";
import {Miner} from "../Blockchain/Miner/Miner";
import {Database} from "../Blockchain/Database/Database";

/**
 * Agrupar configurações necessárias para um ChatCommand
 */
export type ChatCommandConfiguration = {
    /**
     * Moeda.
     */
    coin: CoinModel;

    /**
     * Minerador.
     */
    miner: Miner;

    /**
     * Banco de dados.
     */
    database: Database;
}
