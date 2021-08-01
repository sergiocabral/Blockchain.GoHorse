import {Message} from "../../../../Bus/Message";

/**
 * Mensagem de evento sinalizando alteração do banco de dados.
 */
export class DatabaseUpdatedEvent extends Message {
    /**
     * Construtor.
     * @param description Mensagem relacionada a atualização.
     */
    constructor(public readonly description: string) {
        super();
    }
}
