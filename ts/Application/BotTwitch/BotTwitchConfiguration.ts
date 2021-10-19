import { JsonLoader } from "@sergiocabral/helper";

import { TwitchChatClientConfiguration } from "../../ExternalService/Twitch/Chat/TwitchChatClientConfiguration";
import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends JsonLoader {
  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();

  /**
   * Dados para conexão ao chat da Twitch
   */
  public twitchChat = new TwitchChatClientConfiguration();
}
