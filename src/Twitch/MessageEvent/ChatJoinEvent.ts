import {Message} from "../../Bus/Message";
import {ChatJoinPartModel} from "../Model/ChatJoinPartModel";

/**
 * Quando alguém entra no canal.
 */
export class ChatJoinEvent extends Message {
    /**
     * Resgate
     * @param join Dados da entrada no canal.
     */
    public constructor(
        public join: ChatJoinPartModel) {
        super();
    }
}
