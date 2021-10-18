import { IrcChatClientConfiguration } from "./IrcChatClientConfiguration";

/**
 * Cliente IRC para o chat da Twitch.
 */
export class IrcChatClient {
  /**
   * Construtor.
   * @param configuration Configurações.
   */
  public constructor(
    private readonly configuration: IrcChatClientConfiguration
  ) {}
}
