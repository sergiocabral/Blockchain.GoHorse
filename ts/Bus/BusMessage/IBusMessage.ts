import { ListOfChannels } from "../ListOfChannels";

/**
 * Representa uma mensagem trafegada pelo Bus
 */
export interface IBusMessage {
  /**
   * Canais destinatários.
   */
  get channels(): ListOfChannels;

  /**
   * Identificador único.
   */
  get id(): string;

  /**
   * Tipo da mensagem.
   */
  get type(): string;
}
