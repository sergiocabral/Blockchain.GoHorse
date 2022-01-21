import { ApplicationConfiguration } from '@gohorse/npm-application';
import { RedisConfiguration } from '@gohorse/npm-bus-database-redis';
import { WebSocketServerConfiguration } from '@gohorse/npm-websocket';

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
