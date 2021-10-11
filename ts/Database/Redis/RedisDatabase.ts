import {
  InvalidExecutionError,
  Logger,
  LogLevel,
  RequestError,
} from "@sergiocabral/helper";
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
  private client?: RedisClient;

  /**
   * Sinaliza se a conexão foi iniciada.
   */
  public get opened(): boolean {
    return this.client?.connected === true;
  }

  /**
   * Fechar conexão.
   */
  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.client !== undefined) {
        this.client.quit((error: Error | null) => {
          this.client = undefined;
          if (error === null) {
            Logger.post(
              "The connection to Redis was successfully terminated.",
              undefined,
              LogLevel.Debug,
              RedisDatabase.name
            );
            resolve();
          } else {
            reject(
              new RequestError(
                `Connection to Redis was not terminated successfully: ${error.message}`
              )
            );
          }
        });
      } else {
        reject(new InvalidExecutionError("Redis client is not opened."));
      }
    });
  }

  /**
   * Abrir conexão.
   */
  public async open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let finalized = false;
      const finalize = (error?: string) => {
        finalized = true;
        if (error === undefined) {
          Logger.post(
            "Success in Redis connection to {server}:{port} server in database index {db}.",
            {
              db: this.configuration.databaseIndex,
              port: this.configuration.port,
              server: this.configuration.server,
            },
            LogLevel.Debug,
            RedisDatabase.name
          );
          resolve();
        } else {
          reject(new RequestError(error));
          this.client?.end(false);
        }
      };

      if (this.client === undefined) {
        const client = (this.client = createClient(
          this.configuration.port,
          this.configuration.server,
          {
            db: this.configuration.databaseIndex,
          }
        ));

        if (typeof this.configuration.password === "string") {
          client.auth(this.configuration.password);
        }

        client.on("ready", () => {
          if (finalized) {
            return;
          }

          const randomKey = md5(Math.random().toString());
          client.set(randomKey, randomKey);
          client.del(randomKey, (error: Error | null) =>
            finalize(
              error
                ? `Redis connected but failed while trying to write data: ${error.message}`
                : undefined
            )
          );
        });

        client.on("error", (error: Error) => {
          if (finalized) {
            return;
          }

          finalize(`Connection to Redis failed: ${error?.message}`);
        });
      } else {
        finalize("Redis client already opened.");
      }
    });
  }
}
