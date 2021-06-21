import {UserTagsList} from "../UserWatcher/UserTagsList";
import {ChatListenerHandler} from "../../../Twitch/ChatListener/ChatListenerHandler";
import {ReplyMessageChatListener} from "../../../Twitch/ChatListener/ReplyMessageChatListener";
import {ReplyMessageCountMode} from "../../../Twitch/ChatListener/ReplyMessageCountMode";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";
import {AutomaticResponseList} from "./AutomaticResponseList";

/**
 * Gerencia a reposta automático ao usuário.
 */
export class AutomaticResponse {
    public constructor(
        private userTagsList: UserTagsList,
        private channels: string[],
        private firstMessageAutomaticResponseList: AutomaticResponseList,
        private generalMessageAutomaticResponseList: AutomaticResponseList,
    ) {
        this.chatListenerHandler = new ChatListenerHandler(channels,
            new ReplyMessageChatListener(
                this.factoryReplyFirstMessage.bind(this),
                ReplyMessageCountMode.PerChannel,
                "reset"));
    }

    /**
     * Gerenciador de captura de comandos do chat
     * @private
     */
    private readonly chatListenerHandler: ChatListenerHandler;

    /**
     * Constroi a primeira mensagem de resposta para um usuário.
     * @param message Mensagem.
     * @param messageCount Contagem de mensagem para o usuário.
     * @private
     */
    private factoryReplyFirstMessage(message: ChatMessageModel, messageCount: number): string[] | null {
        const messages: string[] = [];
        if (messageCount === 1) {
            messages.push(...this.factoryReplyMessage(this.firstMessageAutomaticResponseList, message));
        }
        messages.push(...this.factoryReplyMessage(this.generalMessageAutomaticResponseList, message));
        return messages.unique<string>();
    }

    /**
     * Constroi a primeira mensagem de resposta para um usuário.
     * @param automaticResponseList Lista de respostas automática.
     * @param message Mensagem.
     * @private
     */
    private factoryReplyMessage(automaticResponseList: AutomaticResponseList, message: ChatMessageModel): string[] {
        const channel = message.channel.name;
        const username = message.user.name;
        return automaticResponseList
            .getResponsesToUser(channel, this.userTagsList.getUserTags(username), message.message)
            .map(message => message.querystring({ channel, username }));
    }
}
