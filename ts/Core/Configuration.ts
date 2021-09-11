import { InvalidArgumentError } from "@sergiocabral/helper";

import { IConfiguration } from "./IConfiguration";

/**
 * Conjunto de informações de configuração.
 */
export abstract class Configuration<TJson extends {}>
  implements IConfiguration
{
  /**
   * Dados de configuração como JSON (valor original)
   * @protected
   */
  protected json: TJson;

  /**
   * Construtor.
   * @param json Dados de configuração como JSON
   * @protected
   */
  protected constructor(json: unknown) {
    this.json = (
      typeof json === "object" && json !== null ? json : {}
    ) as TJson;
    const errors = this.getErrors(this.json);
    if (errors.length) {
      throw new InvalidArgumentError(
        "Invalid configuration JSON:\n{errors}".querystring({
          errors: errors.map(error => `- ${error}`).join("\n"),
        })
      );
    }
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    return [];
  }

  /**
   * Verificar erros num JSON de configuração.
   */
  protected abstract getErrors(json: Partial<TJson>): string[];
}
