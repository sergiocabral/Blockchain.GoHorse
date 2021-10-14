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

import { HashValue } from "./HashValue";
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
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param value Valor.
   */
  public async addValue(
    table: string,
    key: string,
    value: unknown
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const hashValue = HashValue.format(value);
      this.client.hset(
        this.formatKey(table, key),
        hashValue.id,
        hashValue.content,
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
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param values Valores.
   */
  public async addValues(
    table: string,
    key: string,
    values: unknown[]
  ): Promise<void> {
    for (const value of values) {
      await this.addValue(table, key, value);
    }
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
   * Retorna a lista de chaves presentes em uma tabela de dados.
   * @param table Nome da tabela.
   */
  public async getKeys(table: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const keyPrefix = this.formatKey(table);
      this.client.keys(`${keyPrefix}*`, (error, keys) => {
        if (!error) {
          keys = keys.map((key) => key.substr(keyPrefix.length + 1));
          resolve(keys);
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Retorna os valores presentes em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   */
  public async getValues(table: string, keys?: string[]): Promise<string[]> {
    const values = Array<string>();
    keys = keys ?? (await this.getKeys(table));
    for (const key of keys) {
      values.push(...(await this.getValuesFromKey(table, key)));
    }

    return values;
  }

  /**
   * Retorna o total de valores presentes em uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   */
  public async getValuesCount(table: string, key: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.client.hlen(this.formatKey(table, key), (error, count) => {
        if (!error) {
          resolve(count);
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Retorna os valores presentes em uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   */
  public async getValuesFromKey(table: string, key: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.client.hvals(this.formatKey(table, key), (error, values) => {
        if (!error) {
          values = values.map((value) => HashValue.decode(value));
          resolve(values);
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
   * Remove uma chave presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   */
  public async removeKey(table: string, key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.del(this.formatKey(table, key), (error) => {
        if (!error) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param value Valor.
   */
  public async removeValue(
    table: string,
    key: string,
    value: unknown
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const hashValue = HashValue.format(value);
      this.client.hdel(this.formatKey(table, key), hashValue.id, (error) => {
        if (!error) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   * @param values Valor. Não informado aplica-se a todos.
   */
  public async removeValues(
    table: string,
    keys?: string[],
    values?: unknown[]
  ): Promise<void> {
    keys = keys ?? (await this.getKeys(table));
    for (const key of keys) {
      if (values === undefined) {
        await this.removeKey(table, key);
      } else {
        for (const value of values) {
          await this.removeValue(table, key, value);
        }
      }
    }
  }

  /**
   * Formata a chave para o Redis.
   * @param parts Partes que compõe a chave.¹
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
