import { Logger, Message } from "@sergiocabral/helper";

import { ExchangeCoinMessage } from "./BusMessage/ExchangeCoinMessage";

/**
 * Trata a captura de comandos relacionados a criptomoeda.
 */
export class CoinCommandHandler {
  /**
   * Mensagem: CoinCommandHandler
   */
  private static handleExchangeCoinMessage(message: CoinCommandHandler): void {
    Logger.post(`EXCHANGE: ${JSON.stringify(message)}`);
  }

  /**
   * Construtor.
   */
  public constructor() {
    Message.subscribe(
      ExchangeCoinMessage,
      CoinCommandHandler.handleExchangeCoinMessage.bind(this)
    );
  }
}
