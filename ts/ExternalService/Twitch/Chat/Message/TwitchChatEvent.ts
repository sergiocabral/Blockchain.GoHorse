import { Message } from "@sergiocabral/helper";
import { Events } from "tmi.js";

/**
 * Evento do chat da Twitch.
 */
export class TwitchChatEvent extends Message {
  /**
   * Construtor.
   * @param event Nome do evento.
   * @param args Argumentos recebidos.
   */
  public constructor(
    public readonly event: keyof Events,
    public readonly args: Record<string, unknown>
  ) {
    super();
  }
}
