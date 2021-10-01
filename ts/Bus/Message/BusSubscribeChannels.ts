import { Message } from "@sergiocabral/helper";

import { BusClient } from "../BusClient";
import { ListOfChannels } from "../ListOfChannels";

/**
 * Se inscreve para receber mensagens de um conjunto de canais.
 */
export class BusSubscribeChannels extends Message {
  /**
   * Construtor.
   * @param instance Cliente de acesso ao Bus.
   * @param channels Seleção de canais.
   */
  public constructor(
    public readonly instance: BusClient,
    public readonly channels: ListOfChannels
  ) {
    super();
  }
}
