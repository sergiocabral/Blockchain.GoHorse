import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../../Core/JsonLoaderFieldErrors";

/**
 * Configuração para banco de dados redis
 */
export class RedisConfiguration extends JsonLoader {
  /**
   * Número do banco de dados para conectar.
   */
  public databaseIndex = 0;

  /**
   * Senha de conexão.
   */
  public password?: string | null;

  /**
   * Porta de conexão.
   */
  public port = 6379;

  /**
   * Endereço do servidor.
   */
  public server = "localhost";

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    const minDatabaseIndex = 0;
    const maxDatabaseIndex = 15;
    errors.push(
      ...JsonLoaderFieldErrors.between(this, "databaseIndex", [
        minDatabaseIndex,
        maxDatabaseIndex,
      ])
    );

    errors.push(...JsonLoaderFieldErrors.password(this));
    errors.push(...JsonLoaderFieldErrors.server(this));
    errors.push(...JsonLoaderFieldErrors.port(this));
    errors.push(...super.errors());

    return errors;
  }
}
