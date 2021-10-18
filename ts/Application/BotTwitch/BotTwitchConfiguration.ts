import { JsonLoader } from "@sergiocabral/helper";

import { IrcChatClientConfiguration } from "../../Twitch/IrcChat/IrcChatClientConfiguration";
import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends JsonLoader {
  /**
   * Dados para conexão ao IRC Chat
   */
  public ircChatServer = new IrcChatClientConfiguration();

  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBusWebSocketServer = new WebSocketClientConfiguration();
}
