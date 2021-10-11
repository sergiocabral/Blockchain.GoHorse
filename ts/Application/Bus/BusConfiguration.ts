import { JsonLoader } from "@sergiocabral/helper";

import { RedisConfiguration } from "../../Database/Redis/RedisConfiguration";
import { WebSocketServerConfiguration } from "../../WebSocket/WebSocketServerConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends JsonLoader {
  /**
   * Configuração para banco de dados redis.
   */
  public redisServer = new RedisConfiguration();

  /**
   * Configurações do servidor websocket.
   */
  public webSocketServer = new WebSocketServerConfiguration();
}
