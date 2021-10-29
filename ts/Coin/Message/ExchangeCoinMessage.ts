import { Message } from "@sergiocabral/helper";

/**
 * Realiza o câmbio de uma moeda para outra.
 */
export class ExchangeCoinMessage extends Message {
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
    public readonly message?: string,
  ) {
    super();
  }
}
