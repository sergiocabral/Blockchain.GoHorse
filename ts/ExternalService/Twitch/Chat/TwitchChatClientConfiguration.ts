import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../../../Core/JsonLoaderFieldErrors";
import { TwitchAuthConfiguration } from "../TwitchAuthConfiguration";

/**
 * Dados para conexão ao IRC Chat
 */
export class TwitchChatClientConfiguration extends JsonLoader {
  /**
   * Porta do servidor.
   */
  public port = 443;

  /**
   * Protocolo de conexão.
   */
  public protocol = "wss";

  /**
   * Servidor IRC.
   */
  public server = "irc-ws.chat.twitch.tv";

  /**
   * Se desconectar tentar reconectar novamente.
   */
  public tryReconnectWhenDisconnect = true;

  /**
   * Informações de login na Twitch.
   */
  public twitchAuthentication = new TwitchAuthConfiguration();

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.onTheList(this, "protocol", ["ws", "wss"])
    );
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, "server"));
    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(this, "port", [
        0,
        Number.MAX_SAFE_INTEGER,
      ])
    );
    errors.push(
      ...JsonLoaderFieldErrors.boolean(this, "tryReconnectWhenDisconnect")
    );
    errors.push(...super.errors());

    return errors;
  }
}
