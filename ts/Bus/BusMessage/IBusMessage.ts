import { ListOfChannels } from "../ListOfChannels";

/**
 * Representa uma mensagem trafegada pelo Bus
 */
export interface IBusMessage {
  /**
   * Canais destinatários.
   */
  channels: ListOfChannels;

  /**
   * Identificador único.
   */
  id: string;

  /**
   * Tipo da mensagem.
   */
  type: string;
}
