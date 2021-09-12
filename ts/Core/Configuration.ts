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
  protected initialize: () => this;

  /**
   * Construtor.
   * @param json Dados de configuração como JSON
   */
  protected constructor(json?: unknown) {
    this.initialize = () =>
      Object.assign(
        this,
        typeof json === "object" && json !== null ? json : {}
      );
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public abstract errors(): string[];
}
