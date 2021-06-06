import {ChatCommand} from "./ChatCommand";
import {Message} from "../Bus/Message";
import {ChatCommandEvent} from "./MessageEvent/ChatCommandEvent";
import {SendChatMessageAction} from "./MessageAction/SendChatMessageAction";

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
            .filter(instance => instance.command === message.chatMessage.command)
            .forEach(instance => {
                const response = instance.run(message.chatMessage.getCommandArguments());
                if (response) new SendChatMessageAction(message.chatMessage.channel.name, response).send();
            });
    }
}
