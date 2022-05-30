import { Generate } from '../Helper/Generate';

/**
 * Dados relacionados a instância atualmente em execução.
 */
export class Instance {
  /**
   * Identificador.
   */
  public static readonly id = Generate.id('i');

  /**
   * Data e hora da execução.
   */
  public static readonly startupTime = new Date();
}
