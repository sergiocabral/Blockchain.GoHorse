import { Message } from "@sergiocabral/helper";

/**
 * Websocket iniciou a conexão.
 */
export abstract class WebSocketOpened<TInstance> extends Message {
  /**
   * Construtor.
   * @param instance Instância que gerou a mensagem.
   */
  public constructor(public readonly instance: TInstance) {
    super();
  }
}
