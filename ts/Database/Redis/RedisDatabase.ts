import {
  InvalidExecutionError,
  Logger,
  LogLevel,
  RequestError,
} from "@sergiocabral/helper";
import { createClient, RedisClient, ServerInfo } from "redis";

import { Database } from "../Database";

import { RedisConfiguration } from "./RedisConfiguration";

/**
 * Conexão com um banco de dados Redis.
 */
export class RedisDatabase extends Database<RedisConfiguration> {
  /**
   * Converte as informações do servidor em um hash object.
   */
  private static parseServerInfo(
    serverInfo: ServerInfo
  ): Record<string, string> {
    return String(serverInfo)
      .split("\n")
      .map((entry) => entry.split(":"))
      .reduce<Record<string, string>>((result, entry) => {
        if (entry.length === 1) {
          result.lastSection = entry[0].replace(/\W/g, "");
          if (result.lastSection.length === 0) {
            delete result.lastSection;
          }
        } else {
          result[`${result.lastSection}.${entry[0].trim()}`] =
            entry[1]?.trim() ?? "";
        }

        return result;
      }, {});
  }

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
      const finalize = (result: string | Error) => {
        finalized = true;
        if (typeof result === "string") {
          Logger.post(
            "Success in Redis connection to {server}:{port} server in database index {db}. {result}",
            {
              db: this.configuration.databaseIndex,
              port: this.configuration.port,
              result,
              server: this.configuration.server,
            },
            LogLevel.Debug,
            RedisDatabase.name
          );
          resolve();
        } else {
          reject(new RequestError(result.message));
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

          client.info("all", (error, serverInfo) => {
            const info = RedisDatabase.parseServerInfo(serverInfo);

            finalize(
              error
                ? `Redis connected but failed fetch server info: ${error.message}`
                : `Server Version: {Server.redis_version}, Build Id: {Server.redis_build_id}, Mode: {Server.redis_mode}, Operational System: {Server.os} {Server.arch_bits} bits, TCP port: {Server.tcp_port}.`.querystring(
                    info
                  )
            );
          });
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
