import { Message } from "@sergiocabral/helper";

import { UserModel } from "../Model/UserModel";

/**
 * Mensagem recebida do usuário.
 */
export class UserMessageReceived extends Message {
  /**
   * Construtor.
   * @param id Identificador.
   * @param message Mensagem
   * @param author Autor
   * @param fromPlatform Sinaliza que foi a plataforma de interação que envio a mensagem.
   */
  public constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly author: UserModel,
    public readonly fromPlatform: boolean
  ) {
    super();
  }
}
