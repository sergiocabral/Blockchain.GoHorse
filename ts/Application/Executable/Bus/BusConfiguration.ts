import { ApplicationConfiguration } from "../../../Core/Application/ApplicationConfiguration";
import { RedisConfiguration } from "../../../Database/Redis/RedisConfiguration";
import { WebSocketServerConfiguration } from "../../../WebSocket/WebSocketServerConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends ApplicationConfiguration {
  /**
   * Configurações do servidor websocket.
   */
  public messageBus = new WebSocketServerConfiguration();

  /**
   * Configuração para banco de dados redis.
   */
  public redis = new RedisConfiguration();
}
