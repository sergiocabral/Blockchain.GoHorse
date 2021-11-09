import { Message } from "@sergiocabral/helper";

/**
 * Mensagens emitidas por uma aplicação.
 */
export abstract class MessageApplication extends Message {
  /**
   * Construtor.
   * @param applicationId Identificador da aplicação que emitiu a mensagem.
   */
  public constructor(public readonly applicationId: string) {
    super();
  }
}
