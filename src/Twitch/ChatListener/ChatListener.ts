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
     * Valida se uma mensagem deve ser capturada.
     */
    public abstract isMatch(message: ChatMessageModel): boolean;

    /**
     * Responde uma mensagem.
     * @param message
     * @return Texto de resposta.
     */
    public abstract response(message: ChatMessageModel): string;
}
