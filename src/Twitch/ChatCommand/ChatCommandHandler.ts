import {ChatCommand} from "./ChatCommand";
import {Message} from "../../Bus/Message";
import {ChatCommandEvent} from "../MessageEvent/ChatCommandEvent";
import {SendChatMessageAction} from "../MessageAction/SendChatMessageAction";
import {ChannelFilter} from "./ChannelFilter";
import {channel} from "diagnostic_channel";

/**
 * Gerenciador de captura de comandos do chat.
 */
export class ChatCommandHandler {
    /**
     * Construtor.
     * @param channels Canais.
     * @param commands Comandos para implementar.
     */
    public constructor(
        private readonly channels: string[],
        private readonly commands: typeof ChatCommand[]) {
        this.instances = commands.map(type => new (type as any)());

        Message.capture(ChatCommandEvent, this, this.handlerChatCommandEvent);
    }

    /**
     * Comandos implementados.
     * @private
     */
    private readonly instances: ChatCommand[];

    /**
     * Processador de mensagem.
     * @param message ChatCommandEvent
     * @private
     */
    private handlerChatCommandEvent(message: ChatCommandEvent): void {
        this.instances
            .filter(instance =>
                instance.command === message.chatMessage.command &&
                (instance.listenFromChannels.includes(ChannelFilter.ALL_JOINED_CHANNELS) ||
                    instance.listenFromChannels.findIndex(channel => channel.toLowerCase() === message.chatMessage.channel.name.toLowerCase()) >= 0)
            )
            .forEach(instance => {
                const response = instance.run(message.chatMessage.getCommandArguments());
                if (response) {
                    let toChannels = ([] as string[]).concat(instance.writeToChannels);

                    if (toChannels.includes(ChannelFilter.ALL_JOINED_CHANNELS)) {
                        toChannels.push(...this.channels);
                    }

                    if (toChannels.includes(ChannelFilter.ORIGIN_CHANNEL)) {
                        toChannels.push(message.chatMessage.channel.name);
                    }

                    toChannels = toChannels
                        .map(channelName => channelName.toLowerCase())
                        .unique<string>()
                        .filter(channelName => channelName && !ChannelFilter.isFilter(channelName));

                    for (const toChannel of toChannels) {
                        new SendChatMessageAction(toChannel, response).send();
                    }
                }
            });
    }
}
