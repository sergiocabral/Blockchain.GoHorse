import { Database } from "../Database";

import { RedisConfiguration } from "./RedisConfiguration";

/**
 * Conexão com um banco de dados Redis.
 */
export class RedisDatabase extends Database<RedisConfiguration> {
  /**
   * Fechar conexão.
   */
  public async close(): Promise<void> {
    return new Promise<void>(resolve => resolve());
  }

  /**
   * Abrir conexão.
   */
  public async open(): Promise<void> {
    return new Promise<void>(resolve => resolve());
  }
}
