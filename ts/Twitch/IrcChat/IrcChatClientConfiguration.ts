import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../../Core/JsonLoaderFieldErrors";
import { TwitchAuthConfiguration } from "../TwitchAuthConfiguration";

/**
 * Dados para conexão ao IRC Chat
 */
export class IrcChatClientConfiguration extends JsonLoader {
  /**
   * Informações de login na Twitch.
   */
  public authentication = new TwitchAuthConfiguration();

  /**
   * Porta do servidor.
   */
  public port = 6667;

  /**
   * Se desconectar tentar reconectar novamente.
   */
  public reconnect = true;

  /**
   * Habilita criptografia sobre o protocolo de comunicação.
   */
  public secure = true;

  /**
   * Servidor IRC.
   */
  public server = "irc.chat.twitch.tv";

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(...JsonLoaderFieldErrors.boolean(this, "secure"));
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
