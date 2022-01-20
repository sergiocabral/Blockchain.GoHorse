import { ValueContent } from './ValueContent';
import { ValueId } from './ValueId';

/**
 * Representação de uma valor para gravação no banco de dados.
 */
export interface IValue {
  /**
   * Conteúdo.
   */
  content: ValueContent;

  /**
   * Identificador.
   */
  id: ValueId;
}
