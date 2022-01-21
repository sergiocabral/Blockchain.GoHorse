import { ApplicationBusClientConfiguration } from '@gohorse/npm-application';
import { JsonLoaderFieldErrors } from '@gohorse/npm-core';
import { TwitchChatClientConfiguration } from '@gohorse/npm-twitch';
import { WebSocketClientConfiguration } from '@gohorse/npm-websocket';

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends ApplicationBusClientConfiguration {
  /**
   * Prefixos obrigatórios na mensagem para ela ser trafegada pelo Bus.
   */
  public commandPrefix: string[] = [
    '!cc',
    '!cabr0n',
    '!cabr0ncoin',
    '!cabron',
    '!cabroncoin'
  ];

  /**
   * Conversão de pontos da Twitch para Cabr0n Coin. Montante de Cabr0n Coins resgatados.
   */
  public exchangeTwitchForCabr0nCoinAmount = 1024;

  /**
   * Conversão de pontos da Twitch para Cabr0n Coin. Preço da negociação.
   */
  public exchangeTwitchForCabr0nCoinPrice = 1;

  /**
   * Conversão de pontos da Twitch para Cabr0n Coin. Código do resgate.
   */
  public exchangeTwitchForCabr0nCoinRedeemId =
    '6960fa6f-e820-4b56-8ae0-83ba748fa7d8';

  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();

  /**
   * Assinatura no final da mensagem.
   */
  public messageFormat = '[Client {ID:4}] {message}';

  /**
   * Dados para conexão ao chat da Twitch
   */
  public twitchChat = new TwitchChatClientConfiguration();

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(...JsonLoaderFieldErrors.list(this, 'commandPrefix', 'string'));
    errors.push(
      ...JsonLoaderFieldErrors.uuid(this, 'exchangeTwitchForCabr0nCoinRedeemId')
    );
    errors.push(
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        'exchangeTwitchForCabr0nCoinPrice',
        [1, Number.MAX_SAFE_INTEGER],
        'decimal'
      )
    );
    errors.push(
      ...JsonLoaderFieldErrors.numberBetween(
        this,
        'exchangeTwitchForCabr0nCoinAmount',
        [1, Number.MAX_SAFE_INTEGER],
        'integer'
      )
    );
    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, 'messageFormat'));
    errors.push(...super.errors());

    return errors;
  }
}
