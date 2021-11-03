import { CoinApplication } from "../../Application/Coin/CoinApplication";
import { BusMessageForCommunication } from "../../Bus/BusMessage/BusMessageForCommunication";

/**
 * Realiza o câmbio de uma moeda para outra.
 */
export class ExchangeCoinMessage extends BusMessageForCommunication {
  // TODO: Implementar o parse para BusMessage

  /**
   * Constructor
   * @param from Moeda de origem
   * @param destination Moeda de destino
   * @param price Preço
   * @param amount montante
   * @param message Mensagem pessoal do usuário
   */
  public constructor(
    public readonly from: string,
    public readonly destination: string,
    public readonly price: number,
    public readonly amount: number,
    public readonly message?: string
  ) {
    super([CoinApplication.name]);
  }
}
