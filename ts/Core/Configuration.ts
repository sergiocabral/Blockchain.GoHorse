import { InvalidArgumentError } from "@sergiocabral/helper";

import { IConfiguration } from "./IConfiguration";

/**
 * Conjunto de informações de configuração.
 */
export abstract class Configuration<TJson extends {}>
  implements IConfiguration
{
  /**
   * Carrega as propriedades
   */
  protected loadFromJson: () => void;
  /**
   * Construtor.
   * @param json Dados de configuração como JSON
   */
  protected constructor(json?: unknown) {
    const originalJson = (
      typeof json === "object" && json !== null ? json : {}
    ) as TJson;
    this.loadFromJson = () => Object.assign(this, originalJson);

    if (json !== undefined) {
      const errors = this.getErrors(originalJson);
      if (errors.length > 0) {
        throw new InvalidArgumentError(
          "Invalid configuration JSON:\n{errors}".querystring({
            errors: errors.map((error) => `- ${error}`).join("\n"),
          })
        );
      }
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
