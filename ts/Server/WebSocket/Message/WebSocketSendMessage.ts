import { Message } from "@sergiocabral/helper";

/**
 * Enviar uma mensagem via websocket.
 */
export abstract class WebSocketSendMessage<
  TInstance,
  TDestination
> extends Message {
  /**
   * Construtor.
   * @param instance Instância que gerou a mensagem.
   * @param message Texto que será enviado ao servidor.
   * @param destination Destinatário.
   */
  public constructor(
    public readonly instance: TInstance,
    public readonly message: string,
    public readonly destination?: TDestination | undefined
  ) {
    super();
  }
}
