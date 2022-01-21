import { JsonLoaderFieldErrors } from '@gohorse/npm-core';
import { JsonLoader } from '@sergiocabral/helper';
import { TwitchAuthConfiguration } from '../Core/TwitchAuthConfiguration';

/**
 * Dados para conexão ao IRC Chat
 */
export class TwitchChatClientConfiguration extends JsonLoader {
  /**
   * Lista de canais para ingressar.
   */
  public channels: string[] = ['sergiocabral_com', 'cabr0ncoin', 'cabroncoin'];

  /**
   * Porta do servidor.
   */
  public port = 443;

  /**
   * Protocolo de conexão.
   */
  public protocol = 'wss';

  /**
   * Servidor IRC.
   */
  public server = 'irc-ws.chat.twitch.tv';

  /**
   * Se desconectar tentar reconectar novamente.
   */
  public tryReconnectWhenDisconnect = true;

  /**
   * Informações de login na Core.
   */
  public twitchAuthentication = new TwitchAuthConfiguration();

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.onTheList(this, 'protocol', ['ws', 'wss'])
    );
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, 'server'));
    errors.push(
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        'port',
        [0, Number.MAX_SAFE_INTEGER],
        'integer'
      )
    );
    errors.push(
      ...JsonLoaderFieldErrors.boolean(this, 'tryReconnectWhenDisconnect')
    );
    errors.push(...super.errors());

    return errors;
  }
}
