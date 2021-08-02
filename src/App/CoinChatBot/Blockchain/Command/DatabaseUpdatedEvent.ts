import {Message} from "../../../../Bus/Message";
import {BaseBlockchainChatCommand} from "./BaseBlockchainChatCommand";

/**
 * Mensagem de evento sinalizando alteração do banco de dados.
 */
export class DatabaseUpdatedEvent extends BaseBlockchainChatCommand {
    /**
     * Construtor.
     * @param description Mensagem relacionada a atualização.
     */
    constructor(public readonly description: string) {
        super();
    }
}
