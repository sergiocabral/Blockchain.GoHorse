import { BusMessage } from "../../Bus/BusMessage/BusMessage";
import { BusMessageText } from "../../Bus/BusMessage/Communication/BusMessageText";
import { IBusMessageParse } from "../../Bus/BusMessage/IBusMessageParse";
import { BusMessageJoin } from "../../Bus/BusMessage/Negotiation/BusMessageJoin";
import { ICreateBusMessage } from "../../Bus/ICreateBusMessage";
import { ExchangeCoinMessage } from "../../Coin/BusMessage/ExchangeCoinMessage";
import { UserMessageRejected } from "../../UserInteraction/BusMessage/UserMessageRejected";

/**
 * Criação de mensagens para o Bus a partir de entradas do usuário.
 */
export class CreateBusMessage implements ICreateBusMessage {
  /**
   * Mensagens possíveis de serem
   */
  private readonly messagesTypes: IBusMessageParse[] = [
    BusMessageJoin,
    BusMessageText,
    ExchangeCoinMessage,
    UserMessageRejected,
  ];

  /**
   * Criar uma mensagem do Bus a partir de uma mensagem desconhecida recebida pelo Bus.
   * @param message Mensagem desconhecida.
   */
  public fromReceivedMessage(
    message: unknown | undefined
  ): BusMessage | undefined {
    if (message === undefined || message === null) {
      return undefined;
    }

    if (typeof message === "string") {
      try {
        message = JSON.parse(message);
      } catch (error) {
        return undefined;
      }
    }

    return this.messagesTypes.reduce<BusMessage | undefined>(
      (instance, messageType) =>
        instance ? instance : messageType.parse(message),
      undefined
    );
  }
}
