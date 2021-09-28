import { Message } from "@sergiocabral/helper";

/**
 * Websocket finalizou a conexão.
 */
export abstract class WebSocketClosed<TInstance> extends Message {
  /**
   * Construtor.
   * @param instance Instância que gerou a mensagem.
   * @param code Código de finalização.
   * @param reason Motivo da finalização.
   */
  public constructor(
    public readonly instance: TInstance,
    public readonly code: number,
    public readonly reason: string
  ) {
    super();
  }
}
