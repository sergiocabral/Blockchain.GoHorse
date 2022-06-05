import { IApplicationMessage } from './IApplicationMessage';
import { Message } from '@sergiocabral/helper';
import { Generate } from '../../Helper/Generate';

/**
 * Base abstrata das mensagens entre instâncias.
 */
export abstract class ApplicationMessage
  extends Message
  implements IApplicationMessage
{
  /**
   * Tipo.
   */
  public abstract type: string;

  /**
   * Identificador.
   */
  public id = Generate.id('m');

  /**
   * Construtor.
   * @param fromInstanceId Remetente.
   * @param toInstanceId Destinatário.
   */
  public constructor(
    public readonly fromInstanceId: string,
    public readonly toInstanceId: string
  ) {
    super();
  }
}
