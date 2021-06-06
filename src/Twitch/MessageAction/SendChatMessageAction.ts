import {Message} from "../../Bus/Message";

/**
 * Envia uma mensagem de chat.
 */
export class SendChatMessageAction extends Message {
    /**
     * Construtor.
     * @param channel Canal.
     * @param message Mensagem.
     */
    constructor(
        public channel: string,
        public message: string) {
        super();
    }
}
