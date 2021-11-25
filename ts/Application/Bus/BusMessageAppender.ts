import { IBusMessageParse } from "../../Bus/BusMessage/IBusMessageParse";
import { IBusMessageAppender } from "../../Bus/IBusMessageAppender";
import { ExchangeCoinMessage } from "../../Coin/BusMessage/ExchangeCoinMessage";
import { UserMessageRejected } from "../../UserInteraction/BusMessage/UserMessageRejected";

/**
 * Acrescenta mensagens de Bus que podem ser tratadas.
 */
export class BusMessageAppender implements IBusMessageAppender {
  /**
   * Mensagens possíveis de serem
   */
  public readonly messagesTypes: IBusMessageParse[] = [
    ExchangeCoinMessage,
    UserMessageRejected,
  ];
}
