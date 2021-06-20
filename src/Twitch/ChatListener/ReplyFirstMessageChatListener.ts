import {ChatMessageModel} from "../Model/ChatMessageModel";
import {ChatListener} from "./ChatListener";
import {ReplyFirstMessageMode} from "./ReplyFirstMessageMode";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {ShouldNeverHappen} from "../../Errors/ShouldNeverHappen";

/**
 * Resposta a primeira mensagem do usuário.
 */
export class ReplyFirstMessageChatListener extends ChatListener {

    /**
     * Construtor.
     * @param factoryFirstMessageToReplyUser Função para construir a mensagem de resposta.
     * @param firstMessageMode Modo de considerar primeira mensagem.
     */
    public constructor(
        public factoryFirstMessageToReplyUser: (message: ChatMessageModel) => string[] | string | null,
        public firstMessageMode: ReplyFirstMessageMode
    ) {
        super();
    }

    /**
     *
     * @private
     */
    private cacheForUsersAndChannels: KeyValue<string[]> = { };

    /**
     * Nome temporário da propriedade que recebe a mensagem construída.
     * @private
     */
    private propertyNameForResponse: string = Math.random().toString();

    /**
     * Determina se é primeira mensagem.
     * @param message
     * @private
     */
    private hasCache(message: ChatMessageModel): boolean {
        let result;
        const channel = message.channel.name;
        const username = message.user.name;
        switch (this.firstMessageMode) {
            case ReplyFirstMessageMode.PerChannel:
                result = Boolean(this.cacheForUsersAndChannels[username]?.includes(channel));
                break;
            case ReplyFirstMessageMode.Global:
                result = Boolean(this.cacheForUsersAndChannels[username]);
                break;
            default:
                throw new ShouldNeverHappen();
        }
        return result;
    }

    /**
     * Coloca uma mensagem no cache.
     * @param message
     * @private
     */
    private putCache(message: ChatMessageModel): void {
        const channel = message.channel.name;
        const username = message.user.name;
        this.cacheForUsersAndChannels[username] = this.cacheForUsersAndChannels[username] ?? [];
        if (!this.cacheForUsersAndChannels[username].includes(channel)) {
            this.cacheForUsersAndChannels[username].push(channel);
        }
    }

    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        const isFirst = !this.hasCache(message);
        if (isFirst) {
            const response = this.factoryFirstMessageToReplyUser(message);
            if (response?.length) {
                (message as any)[this.propertyNameForResponse] = response;
                this.putCache(message);
                return true;
            }
        }
        return false;
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
