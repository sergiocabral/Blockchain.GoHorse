import { Message } from "@sergiocabral/helper";

/**
 * Websocket teve um erro.
 */
export abstract class WebSocketError<TInstance> extends Message {
  /**
   * Construtor.
   * @param instance Instância que gerou a mensagem.
   * @param error Erro.
   */
  public constructor(
    public readonly instance: TInstance,
    public readonly error: Error
  ) {
    super();
  }
}
