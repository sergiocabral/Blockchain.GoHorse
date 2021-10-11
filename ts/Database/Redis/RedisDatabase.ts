import { Database } from "../Database";

import { RedisConfiguration } from "./RedisConfiguration";

/**
 * Conexão com um banco de dados Redis.
 */
export class RedisDatabase extends Database<RedisConfiguration> {
  /**
   * Sinaliza se a conexão foi iniciada.
   */
  public get opened(): boolean {
    return false;
  }

  /**
   * Fechar conexão.
   */
  public async close(): Promise<void> {
    return new Promise<void>((resolve) => resolve());
  }

  /**
   * Abrir conexão.
   */
  public async open(): Promise<void> {
    return new Promise<void>((resolve) => resolve());
  }
}
