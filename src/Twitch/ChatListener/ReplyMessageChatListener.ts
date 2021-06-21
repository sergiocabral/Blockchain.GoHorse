import {ChatMessageModel} from "../Model/ChatMessageModel";
import {ChatListener} from "./ChatListener";
import {ReplyMessageCountMode} from "./ReplyMessageCountMode";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {ShouldNeverHappen} from "../../Errors/ShouldNeverHappen";

/**
 * Resposta a primeira mensagem do usuário.
 */
export class ReplyMessageChatListener extends ChatListener {

    /**
     * Construtor.
     * @param factoryResponseMessage Função para construir a mensagem de resposta.
     * @param messageCountMode Modo de considerar primeira mensagem.
     * @param commandToClearMessageCount Comando para limpar o contador de mensagens.
     */
    public constructor(
        public factoryResponseMessage: (message: ChatMessageModel, messageCount: number) => string[] | string | null,
        public messageCountMode: ReplyMessageCountMode,
        private readonly commandToClearMessageCount: string | null = null
    ) {
        super();
    }

    /**
     * Contagem de mensagem por usuário em cada canal.
     * @private
     */
    private messageCountForUserAtChannel: KeyValue<KeyValue<number>> = { };

    /**
     * Nome temporário da propriedade que recebe a mensagem construída.
     * @private
     */
    private propertyNameForResponse: string = Math.random().toString();

    /**
     * Limpa a contagem de mensagens por usuário.
     * @private
     */
    private clearMessageCount(message: ChatMessageModel): void {
        const channel = message.channel.name;
        const username = message.user.name;
        switch (this.messageCountMode) {
            case ReplyMessageCountMode.PerChannel:
                if (this.messageCountForUserAtChannel[username]) {
                    delete this.messageCountForUserAtChannel[username][channel];
                }
                break;
            case ReplyMessageCountMode.Global:
                delete this.messageCountForUserAtChannel[username];
                break;
            default:
                throw new ShouldNeverHappen();
        }
    }

    /**
     * Retorna o número de mensagem por usuário.
     * @param message
     * @private
     */
    private getMessageCount(message: ChatMessageModel): number {
        let messageCount: number;
        const channel = message.channel.name;
        const username = message.user.name;
        this.messageCountForUserAtChannel[username] = this.messageCountForUserAtChannel[username] || { };
        switch (this.messageCountMode) {
            case ReplyMessageCountMode.PerChannel:
                messageCount = this.messageCountForUserAtChannel[username][channel] || 0;
                break;
            case ReplyMessageCountMode.Global:
                messageCount = Object
                    .keys(this.messageCountForUserAtChannel[username])
                    .reduce((previous, channel) =>
                        previous + this.messageCountForUserAtChannel[username][channel], 0);
                break;
            default:
                throw new ShouldNeverHappen();
        }
        return messageCount;
    }

    /**
     * Incrementa o número de mensagem por usuário.
     * @param message
     * @private
     */
    private incrementMessageCount(message: ChatMessageModel): void {
        const channel = message.channel.name;
        const username = message.user.name;
        this.messageCountForUserAtChannel[username] = this.messageCountForUserAtChannel[username] || { };
        this.messageCountForUserAtChannel[username][channel] = (this.messageCountForUserAtChannel[username][channel] || 0) + 1;
    }

    /**
     * Valida se é o comando para limpar cache.
     * @param message
     * @private
     */
    private isMatchForClearCache(message: ChatMessageModel): boolean {
        return (
            this.commandToClearMessageCount !== null &&
            message.channel.name.toLowerCase() === message.user.name.toLowerCase() &&
            message.isCommand &&
            message.command === this.commandToClearMessageCount.toLowerCase()
        );
    }

    /**
     * Valida se existe mensagem de resposta.
     * @param message
     * @private
     */
    private isMatchForResponseMessage(message: ChatMessageModel): boolean {
        this.incrementMessageCount(message);
        const messageCount = this.getMessageCount(message);
        const response = this.factoryResponseMessage(message, messageCount);
        if (response?.length) {
            (message as any)[this.propertyNameForResponse] = response;
            return true;
        }
        return false;
    }

    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        if (this.isMatchForClearCache(message)) {
            this.clearMessageCount(message);
            return false;
        }

        return this.isMatchForResponseMessage(message);
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
