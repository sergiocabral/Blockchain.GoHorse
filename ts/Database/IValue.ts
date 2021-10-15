import { ValueId } from "./ValueId";

/**
 * Representação de uma valor para gravação no banco de dados.
 */
export interface IValue {
  /**
   * Conteúdo.
   */
  content: string;

  /**
   * Identificador.
   */
  id: ValueId;
}
