import {ChatMessageModel} from "../Model/ChatMessageModel";
import {ChatListener} from "./ChatListener";

/**
 * Resposta a primeira mensagem do usuário.
 */
export class ReplyFirstMessageChatListener extends ChatListener {

    /**
     * Construtor.
     * @param factoryFirstMessageToReplyUser Função para construir a mensagem de resposta.
     */
    public constructor(
        private factoryFirstMessageToReplyUser: (message: ChatMessageModel) => string[] | string | null
    ) {
        super();
    }

    /**
     * Nome temporário da propriedade que recebe a mensagem construída.
     * @private
     */
    private propertyNameForResponse: string = Math.random().toString();

    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        const response = this.factoryFirstMessageToReplyUser(message);
        const isMatch = Boolean(response);
        if (isMatch) (message as any)[this.propertyNameForResponse] = response;
        return isMatch;
    }

    /**
     * Responde uma mensagem.
     * @param message
     * @return Texto de resposta.
     */
    public response(message: ChatMessageModel): string[] | string {
        const response: string[] | string = (message as any)[this.propertyNameForResponse];
        delete (message as any)[this.propertyNameForResponse];
        return response;
    }
}
