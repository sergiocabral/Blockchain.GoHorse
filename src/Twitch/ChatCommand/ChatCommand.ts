import {ChannelFilter} from "./ChannelFilter";

/**
 * Classe base para comandos de chat.
 */
export abstract class ChatCommand {
    /**
     * Canais onde o comando será ouvido.
     */
    public get listenFromChannels(): string[] {
        return [
            ChannelFilter.ALL_JOINED_CHANNELS
        ];
    }

    /**
     * Canais onde o comando será respondido.
     */
    public get writeToChannels(): string[] {
        return [
            ChannelFilter.ORIGIN_CHANNEL
        ];
    }

    /**
     * Comando a ser tratado.
     */
    public abstract get command(): string;

    /**
     * Execução do comando.
     * @param args Argumentos recebidos.
     * @return Texto a ser enviado para o chat.
     */
    public abstract run(args: string[]): string
}
