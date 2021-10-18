import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../../Core/JsonLoaderFieldErrors";

/**
 * Dados para conexão ao IRC Chat
 */
export class IrcChatClientConfiguration extends JsonLoader {
  /**
   * Porta do servidor.
   */
  public port = 6667;

  /**
   * Protocolo de comunicação.
   */
  public protocol = "irc";

  /**
   * Servidor IRC.
   */
  public server = "irc.chat.twitch.tv";

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.onTheList(this, "protocol", ["ws", "wss", "irc"])
    );
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, "server"));
    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(this, "port", [
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    );
    errors.push(...super.errors());

    return errors;
  }
}
