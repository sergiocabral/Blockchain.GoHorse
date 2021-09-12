import { NotImplementedError } from "@sergiocabral/helper";

import { IConfiguration } from "./IConfiguration";

/**
 * Conjunto de informações de configuração.
 */
export abstract class Configuration<TJson extends {}>
  implements IConfiguration
{
  /**
   * Carrega as propriedades do JSON.
   */
  public initialize: () => this;

  /**
   * Construtor.
   * @param json Dados de configuração como JSON
   */
  public constructor(json?: unknown) {
    let initialized = false;

    setImmediate(() => {
      if (!initialized) {
        throw new NotImplementedError(
          `${this.constructor.name} did not call initialize().`
        );
      }
    });

    this.initialize = () => {
      this.initialize = () => this;

      initialized = true;

      return Object.assign(
        this,
        typeof json === "object" && json !== null ? json : {}
      );
    };
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public abstract errors(): string[];
}
