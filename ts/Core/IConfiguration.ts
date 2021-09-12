/**
 * Conjunto de informações de configuração.
 */
export interface IConfiguration {
  /**
   * Lista de erros presentes na configuração atual
   */
  errors(): string[];

  /**
   * Carrega as propriedades do JSON.
   */
  initialize(): void;
}
