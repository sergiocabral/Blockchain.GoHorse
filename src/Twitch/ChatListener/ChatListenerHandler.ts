import {ChatListener} from "./ChatListener";
import {Message} from "../../Bus/Message";
import {ChatMessageEvent} from "../MessageEvent/ChatMessageEvent";
import {SendChatMessageCommand} from "../MessageCommand/SendChatMessageCommand";
import {ChannelFilter} from "./ChannelFilter";
import {UserFilter} from "./UserFilter";

/**
 * Gerenciador de captura de comandos do chat.
 */
export class ChatListenerHandler {
    /**
     * Construtor.
     * @param channels Canais.
     * @param listeners Mensagens ou comandos.
     */
    public constructor(
        private readonly channels: string[],
        ...listeners: ChatListener[]) {
        this.instances = listeners;
        Message.capture(ChatMessageEvent, this.handlerChatMessageEvent.bind(this));
    }

    /**
     * Comandos implementados.
     * @private
     */
    private readonly instances: ChatListener[];

    /**
     * Verifica se uma ChatListener corresponde a um ChatMessageEvent
     * @param chatListener
     * @param chatMessageEvent
     * @private
     */
    private isMatch(chatListener: ChatListener, chatMessageEvent: ChatMessageEvent): boolean {
        const channelMatch = (
            chatListener.listenFromChannels.includes(ChannelFilter.ALL_JOINED_CHANNELS) ||
            chatListener.listenFromChannels.findIndex(channel => channel.toLowerCase() === chatMessageEvent.chatMessage.channel.name.toLowerCase()) >= 0
        );
        if (!channelMatch) return false;

        const userMatch = (
            chatListener.listenFromUsers.includes(UserFilter.ALL_USERS) ||
            (chatListener.listenFromUsers.includes(UserFilter.OWNER_CHANNEL) && chatMessageEvent.chatMessage.user.name.toLowerCase() === chatMessageEvent.chatMessage.channel.name.toLowerCase()) ||
            chatListener.listenFromUsers.findIndex(user => user.toLowerCase() === chatMessageEvent.chatMessage.user.name.toLowerCase()) >= 0
        );
        if (!userMatch) return false;

        return chatListener.isMatch(chatMessageEvent.chatMessage);
    }

    /**
     * Responde um ChatListener
     * @param chatListener
     * @param chatMessageEvent
     * @private
     */
    private response(chatListener: ChatListener, chatMessageEvent: ChatMessageEvent): void {
        const responses = ([] as string[]).concat(chatListener.response(chatMessageEvent.chatMessage));
        if (responses.length === 0) return;

        let toChannels = ([] as string[]).concat(chatListener.writeToChannels);

        if (toChannels.includes(ChannelFilter.ALL_JOINED_CHANNELS)) {
            toChannels.push(...this.channels);
        }

        if (toChannels.includes(ChannelFilter.ORIGIN_CHANNEL)) {
            toChannels.push(chatMessageEvent.chatMessage.channel.name);
        }

        toChannels = toChannels
            .map(channelName => channelName.toLowerCase())
            .unique<string>()
            .filter(channelName => channelName && !ChannelFilter.isFilter(channelName));

        for (const toChannel of toChannels) {
            for (const response of responses) {
                new SendChatMessageCommand(toChannel, response).send();
            }
        }
    }

    /**
     * Processador de mensagem.
     * @param message ChatCommandEvent
     * @private
     */
    private handlerChatMessageEvent(message: ChatMessageEvent): void {
        this.instances
            .filter(instance => this.isMatch(instance, message))
            .forEach(instance => this.response(instance, message));
    }
}
