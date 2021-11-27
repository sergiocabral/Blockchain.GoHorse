/* tslint:disable:no-null-keyword */
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
   * Tempo padrão para que as chaves expirem.
   */
  public expireAfterSeconds?: number | null = 86400;

  /**
   * Namespace para demais entradas de dados.
   */
  public namespace?: string | null = null;

  /**
   * Senha de conexão.
   */
  public password?: string | null = null;

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
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        "databaseIndex",
        [0, Number.MAX_SAFE_INTEGER],
        "integer"
      )
    );
    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "namespace"));
    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "password"));
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, "server"));
    errors.push(
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        "port",
        [0, Number.MAX_SAFE_INTEGER],
        "integer"
      )
    );
    if (
      this.expireAfterSeconds !== undefined &&
      this.expireAfterSeconds !== null
    ) {
      errors.push(
        ...JsonLoaderFieldErrors.numberBetween(
          this,
          "expireAfterSeconds",
          [0, Number.MAX_SAFE_INTEGER],
          "integer"
        )
      );
    }
    errors.push(...super.errors());

    return errors;
  }
}
