import { InvalidExecutionError, RequestError } from "@sergiocabral/helper";
import md5 from "md5";
import { createClient, RedisClient } from "redis";

import { Database } from "../Database";

import { RedisConfiguration } from "./RedisConfiguration";

/**
 * Conexão com um banco de dados Redis.
 */
export class RedisDatabase extends Database<RedisConfiguration> {
  /**
   * Cliente de conexão com o Redis.
   */
  private clientValue?: RedisClient;

  /**
   * Sinaliza se a conexão foi iniciada.
   */
  public get opened(): boolean {
    return this.clientValue?.connected === true;
  }

  /**
   * Cliente de conexão com o Redis.
   */
  private get client(): RedisClient {
    if (this.clientValue === undefined) {
      throw new InvalidExecutionError("Redis client is not opened.");
    }

    return this.clientValue;
  }

  /**
   * Cliente de conexão com o Redis.
   */
  private set client(value: RedisClient | undefined) {
    if (this.clientValue !== undefined && value !== undefined) {
      throw new InvalidExecutionError("Redis client already opened.");
    }
    this.clientValue = value;
  }

  /**
   * Fechar conexão.
   */
  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.quit((error: Error | null) => {
        this.client = undefined;
        if (error === null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Abrir conexão.
   */
  public async open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client = createClient(
        this.configuration.port,
        this.configuration.server,
        {
          db: this.configuration.databaseIndex,
        }
      );

      if (typeof this.configuration.password === "string") {
        this.client.auth(this.configuration.password);
      }

      let finalized = false;
      const finalize = (error?: string) => {
        finalized = true;
        if (error === undefined) {
          resolve();
        } else {
          reject(new RequestError(error));
          this.client.end(false);
        }
      };

      this.client.on("ready", () => {
        if (finalized) {
          return;
        }

        const randomKey = md5(Math.random().toString());
        this.client.set(randomKey, randomKey);
        this.client.del(randomKey, (error: Error | null) =>
          finalize(
            error
              ? `Redis connected but failed while trying to write data: ${error.message}`
              : undefined
          )
        );
      });

      this.client.on("error", (error: Error) => {
        if (finalized) {
          return;
        }

        finalize(`Connection to Redis failed: ${error?.message}`);
      });
    });
  }
}
