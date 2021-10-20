import { Message } from "@sergiocabral/helper";

import { UserModel } from "../Model/UserModel";

/**
 * Mensagem recebida do usuário.
 */
export class UserMessageReceived extends Message {
  /**
   * Construtor.
   * @param message Mensagem
   * @param author Autor
   */
  public constructor(
    public readonly message: string,
    public readonly author: UserModel
  ) {
    super();
  }
}
