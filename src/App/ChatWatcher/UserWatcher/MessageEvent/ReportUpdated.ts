import {Message} from "../../../../Bus/Message";
import {KeyValue} from "../../../../Helper/Types/KeyValue";
import {UserOnChatModel} from "../../Model/UserOnChatModel";

/**
 * Dados atualizados.
 */
export class ReportUpdated extends Message {
    /**
     * Construtor.
     * @param report Relatório.
     */
    public constructor(
        public report: KeyValue<UserOnChatModel[]>) {
        super();
    }
}
