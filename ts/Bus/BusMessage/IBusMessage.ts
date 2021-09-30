import { AllChannels } from "../AllChannels";

/**
 * Representa uma mensagem trafegada pelo Bus
 */
export interface IBusMessage {
  /**
   * Canais destinatários.
   */
  get channels(): AllChannels | string[];

  /**
   * Identificador único.
   */
  get id(): string;

  /**
   * Tipo da mensagem.
   */
  get type(): string;
}
