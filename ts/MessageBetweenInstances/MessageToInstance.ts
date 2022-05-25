import { IMessageToInstance } from './IMessageToInstance';
import { Message } from '@sergiocabral/helper';

/**
 * Base abstrata das mensagens entre instâncias.
 */
export abstract class MessageToInstance
  extends Message
  implements IMessageToInstance
{
  /**
   * Tipo da mensagem.
   */
  public abstract type: string;

  /**
   * Construtor.
   * @param fromInstanceId Instância remetente da mensagem
   * @param toInstanceId Instância que recebe a mensagem
   */
  public constructor(
    public readonly fromInstanceId: string,
    public readonly toInstanceId: string
  ) {
    super();
  }
}
