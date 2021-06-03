import {Message} from "../../Bus/Message";
import {ChatJoinPartModel} from "../Model/ChatJoinPartModel";

/**
 * Quando alguém sai do canal
 */
export class ChatPartEvent extends Message {
    /**
     * Resgate
     * @param part Dados da saída do canal
     */
    public constructor(
        public part: ChatJoinPartModel) {
        super();
    }
}
