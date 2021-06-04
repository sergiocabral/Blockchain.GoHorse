import {Message} from "../../Bus/Message";
import {ChatMessageModel} from "../Model/ChatMessageModel";

/**
 * Quando uma mensagem é enviada
 */
export class ChatMessageEvent extends Message {
    /**
     * Resgate
     * @param chatMessage
     */
    public constructor(
        public chatMessage: ChatMessageModel) {
        super();
    }
}
