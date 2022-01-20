import { Message } from '@sergiocabral/helper';

import { IBusMessageParse } from '../BusMessage/IBusMessageParse';

/**
 * Acrescenta mensagens de Core que podem ser tratadas.
 */
export class AttachMessagesToBus extends Message {
  /**
   * Mensagens possíveis de serem tratadas
   */
  public readonly messagesTypes: IBusMessageParse[];

  /**
   * Construtor.
   * @param messagesTypes Mensagens possíveis de serem tratadas.
   */
  public constructor(...messagesTypes: IBusMessageParse[]) {
    super();
    this.messagesTypes = messagesTypes;
  }
}
