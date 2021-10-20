import { TwitchChatMessage } from "../../../ExternalService/Twitch/Chat/Message/TwitchChatMessage";

import { ChannelFilter } from "./ChannelFilter";
import { UserFilter } from "./UserFilter";

/**
 * Classe base para listeners de chat.
 */
export abstract class ChatListener {
  /**
   * Canais onde a mensagem será ouvida.
   */
  public get listenFromChannels(): string[] {
    return [ChannelFilter.ALL_JOINED_CHANNELS];
  }

  /**
   * Usuário de quem a mensagem será ouvida.
   */
  public get listenFromUsers(): string[] {
    return [UserFilter.ALL_USERS];
  }

  /**
   * Canais onde a mensagem será respondida.
   */
  public get writeToChannels(): string[] {
    return [ChannelFilter.ORIGIN_CHANNEL];
  }

  /**
   * Valida se uma mensagem deve ser capturada.
   * @param message Mensagem.
   * @return Sinaliza que deve ser capturada.
   */
  public abstract isMatch(message: TwitchChatMessage): boolean;

  /**
   * Responde uma mensagem.
   * @param message Mensagem.
   * @return Texto de resposta.
   */
  public abstract response(message: TwitchChatMessage): string[];
}
