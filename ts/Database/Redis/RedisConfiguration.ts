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
   * Namespace para demais entradas de dados.
   */
  public namespace?: string | null;

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

    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(this, "databaseIndex", [
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    );
    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "namespace"));
    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "password"));
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, "server"));
    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(this, "port", [
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    );
    errors.push(...super.errors());

    return errors;
  }
}
