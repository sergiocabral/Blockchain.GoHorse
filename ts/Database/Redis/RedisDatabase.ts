import {
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
  NotReadyError,
  RequestError,
} from "@sergiocabral/helper";
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
   * Cliente de conexão com o Redis pronto para uso.
   */
  private get client(): RedisClient {
    if (this.clientValue === undefined) {
      throw new NotReadyError("Redis client is not ready.");
    }

    return this.clientValue;
  }

  /**
   * Fechar conexão.
   */
  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.clientValue !== undefined) {
        this.clientValue.quit((error: Error | null) => {
          this.clientValue = undefined;
          if (!error) {
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
   * Apaga uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   */
  public async del(tableName: string, id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.del(this.formatKey(tableName, id), (error) => {
        if (!error) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Retorna informações sobre o servidor.
   * @param section Seções
   */
  public async info(...section: string[]): Promise<Record<string, string>> {
    return new Promise<Record<string, string>>((resolve, reject) => {
      this.client.info(section, (error, serverInfo) => {
        if (!error) {
          const info = String(serverInfo)
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

          resolve(info);
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
          this.clientValue?.end(false);
        }
      };

      if (this.clientValue === undefined) {
        const client = (this.clientValue = createClient(
          this.configuration.port,
          this.configuration.server,
          {
            db: this.configuration.databaseIndex,
          }
        ));

        if (typeof this.configuration.password === "string") {
          client.auth(this.configuration.password);
        }

        client.on("ready", async () => {
          if (finalized) {
            return;
          }

          try {
            finalize(
              `Server Version: {Server.redis_version}, Build Id: {Server.redis_build_id}, Mode: {Server.redis_mode}, Operational System: {Server.os} {Server.arch_bits} bits, TCP port: {Server.tcp_port}.`.querystring(
                await this.info("server")
              )
            );
          } catch (error: unknown) {
            finalize(
              new Error(
                `Redis connected but failed fetch server info: ${
                  error instanceof Error ? error.message : String(error)
                }`
              )
            );
          }
        });

        client.on("error", (error: Error) => {
          if (finalized) {
            return;
          }

          finalize(new Error(`Connection to Redis failed: ${error?.message}`));
        });
      } else {
        finalize(new Error("Redis client already opened."));
      }
    });
  }

  /**
   * Grava uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   * @param value Valor.
   */
  public async set(
    tableName: string,
    id: string,
    value: unknown
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.set(
        this.formatKey(tableName, id),
        JSON.stringify(value),
        (error) => {
          if (!error) {
            resolve();
          } else {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Retorna um identificador baseado no momento atual.
   */
  public timeId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.client.time((error, time) => {
        if (!error) {
          const timeId = `${time[0]}${time[1]}`;
          resolve(timeId);
        } else {
          reject(error);
        }
      })
    });
  }

  /**
   * Formnata a chave para o Redis.
   * @param parts Partes que compõe a chave.
   */
  private formatKey(...parts: string[]): string {
    if (parts.length === 0) {
      throw new InvalidArgumentError("Expected part of key");
    }

    if (this.configuration.namespace) {
      parts.unshift(this.configuration.namespace);
    }

    return parts.join(":");
  }
}
