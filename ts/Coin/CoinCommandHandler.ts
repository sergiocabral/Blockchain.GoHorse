import { Logger, Message } from "@sergiocabral/helper";

import { Lock } from "../Lock/Message/Lock";

import { ExchangeCoinMessage } from "./BusMessage/ExchangeCoinMessage";

/**
 * Trata a captura de comandos relacionados a criptomoeda.
 */
export class CoinCommandHandler {
  /**
   * Mensagem: CoinCommandHandler
   */
  private static handleExchangeCoinMessage(message: ExchangeCoinMessage): void {
    new Lock()
      .with(message.id)
      .execute(() => {
        Logger.post(`EXCHANGE: ${JSON.stringify(message)}`);
      })
      .send();
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
