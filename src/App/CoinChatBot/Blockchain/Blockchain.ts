import {CoinModel} from "../Model/CoinModel";
import {Database} from "./Database/Database";
import {Miner} from "./Miner/Miner";
import {InvalidExecutionError} from "../../../Errors/InvalidExecutionError";
import {Definition} from "./Definition";
import {ChatListener} from "../../../Twitch/ChatListener/ChatListener";
import {HelpChatCommand} from "../ChatCommand/HelpChatCommand";
import {RegisterWalletChatCommand} from "../ChatCommand/RegisterWalletChatCommand";
import {ChatCommandConfiguration} from "../ChatCommand/ChatCommandConfiguration";
import {DatabaseUpdatedEvent} from "./Command/DatabaseUpdatedEvent";
import {Message} from "../../../Bus/Message";
import {SetProfileStatusChatCommand} from "../ChatCommand/SetProfileStatusChatCommand";
import Timeout = NodeJS.Timeout;
import {List} from "../../../Helper/List";
import {InvalidChatCommand} from "../ChatCommand/InvalidChatCommand";

/**
 * Responsável por enfileirar comandos para operar a moeda.
 */
export class Blockchain {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        this.miner = new Miner(coin, this.minerInitialized.bind(this));
        this.database = new Database(coin, this.miner.firstBlock, this.miner.branchName, this.miner.directory);

        Message.capture(DatabaseUpdatedEvent, this.handleDatabaseUpdatedEvent.bind(this));
    }

    /**
     * Timeout para bounce da gravação do banco de dados.
     * @private
     */
    private mineTimeout: Timeout = 0 as any;

    /**
     * Lista de mensagens para gravação.
     * @private
     */
    private mineMessages: string[] = [];

    /**
     * Grava o banco de dados na blockchain.
     * @param message Mensagem na blockchain.
     * @private
     */
    private mine(message: string): void {
        clearTimeout(this.mineTimeout);
        this.mineMessages.push(message);
        this.mineTimeout = setTimeout(() => {
            const message = List.unique(this.mineMessages).join(' / ');
            this.mineMessages.length = 0;
            this.miner.commit(message);
        }, Definition.WaitSecondsBeforeMiner * 1000);
    }

    /**
     *
     * @param message
     * @private
     */
    private handleDatabaseUpdatedEvent(message: DatabaseUpdatedEvent) {
        this.mine(message.description);
        message.output.push('Changes will be available in the next mined block.'.translate());
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

        this.database.updateDocumentation();
        await this.miner.commit("Updated documentation files.");
    }

    /**
     * Retorna a lista de comandos para operar a blockchain.
     */
    public getChatCommands(): ChatListener[] {
        const configuration: ChatCommandConfiguration = {
            coin: this.coin,
            miner: this.miner,
            database: this.database
        };
        return [
            new HelpChatCommand(configuration),
            new SetProfileStatusChatCommand(configuration),
            new RegisterWalletChatCommand(configuration),
            new InvalidChatCommand(configuration),
        ];
    }
}
