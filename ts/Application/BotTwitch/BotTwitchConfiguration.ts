import { JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../../Core/JsonLoaderFieldErrors";
import { TwitchChatClientConfiguration } from "../../ExternalService/Twitch/Chat/TwitchChatClientConfiguration";
import { WebSocketClientConfiguration } from "../../WebSocket/WebSocketClientConfiguration";

/**
 * Configurações do BotTwitchApplication
 */
export class BotTwitchConfiguration extends JsonLoader {
  /**
   * Conversão de pontos da Twitch para Cabr0n Coin. Montante de Cabr0n Coins resgatados.
   */
  public exchangeTwitchForCabr0nCoinAmount = 1024;

  /**
   * Conversão de pontos da Twitch para Cabr0n Coin. Código do resgate.
   */
  public exchangeTwitchForCabr0nCoinRedeemId =
    "6960fa6f-e820-4b56-8ae0-83ba748fa7d8";

  /**
   * Configurações para conectar ao servidor websocket.
   */
  public messageBus = new WebSocketClientConfiguration();

  /**
   * Dados para conexão ao chat da Twitch
   */
  public twitchChat = new TwitchChatClientConfiguration();

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.uuid(this, "exchangeTwitchForCabr0nCoinRedeemId")
    );
    errors.push(
      ...JsonLoaderFieldErrors.integerBetween(
        this,
        "exchangeTwitchForCabr0nCoinAmount",
        [1, Number.MAX_SAFE_INTEGER]
      )
    );
    errors.push(...super.errors());

    return errors;
  }
}
