import { MessageApplication } from "../../Core/Message/MessageApplication";
import { UserModel } from "../Model/UserModel";

/**
 * Mensagem recebida do usuário.
 */
export class UserMessageReceived extends MessageApplication {
  /**
   * Construtor.
   * @param message Mensagem
   * @param author Autor
   * @param fromPlatform Sinaliza que foi a plataforma de interação que envio a mensagem.
   * @param applicationId Identificador da aplicação.
   */
  public constructor(
    public readonly message: string,
    public readonly author: UserModel,
    public readonly fromPlatform: boolean,
    applicationId: string
  ) {
    super(applicationId);
  }
}
