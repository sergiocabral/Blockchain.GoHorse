import { IBusMessageParse } from "./BusMessage/IBusMessageParse";

/**
 * Acrescenta mensagens de Bus que podem ser tratadas.
 */
export interface IBusMessageAppender {
  /**
   * Mensagens possíveis de serem tratadas.
   */
  get messagesTypes(): IBusMessageParse[];
}
