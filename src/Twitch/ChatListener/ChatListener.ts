import {ChannelFilter} from "./ChannelFilter";
import {UserFilter} from "./UserFilter";
import {ChatMessageModel} from "../Model/ChatMessageModel";

/**
 * Classe base para listeners de chat.
 */
export abstract class ChatListener {
    /**
     * Canais onde a mensagem será ouvida.
     */
    public get listenFromChannels(): string[] {
        return [
            ChannelFilter.ALL_JOINED_CHANNELS
        ];
    }

    /**
     * Canais onde a mensagem será respondida.
     */
    public get writeToChannels(): string[] {
        return [
            ChannelFilter.ORIGIN_CHANNEL
        ];
    }

    /**
     * Usuário de quem a mensagem será ouvida.
     */
    public get listenFromUsers(): string[] {
        return [
            UserFilter.ALL_USERS
        ];
    }

    /**
     * Sinaliza que é um comando.
     * Nesse caso mensage se refere ao nome do comando,
     * ao invés do texto da mensagem
     */
    public abstract get isCommand(): boolean;

    /**
     * Mensagem recebida
     */
    public abstract get message(): string;

    /**
     * Resposta a uma mensagem.
     * @return Texto a ser enviado para o chat.
     */
    public abstract response(chatMessage: ChatMessageModel): string
}
