import {Message} from "../../Bus/Message";
import {ChatMessageModel} from "../Model/ChatMessageModel";

/**
 * Evento disparado quando um comando é recebeido do chat.
 */
export class ChatCommandEvent extends Message {
    /**
     * Resgate
     * @param chatMessage
     */
    public constructor(
        public chatMessage: ChatMessageModel) {
        super();
    }
}
