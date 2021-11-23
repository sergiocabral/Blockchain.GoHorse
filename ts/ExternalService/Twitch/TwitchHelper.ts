import { Userstate } from "tmi.js";

import { UserModel } from "../../Business/UserInteraction/Model/UserModel";

/**
 * Utilário para o namespace da Twitch.
 */
export class TwitchHelper {
  /**
   * Cria uma instância do modelo de usuário
   */
  public static createUserModel(input: Userstate): UserModel {
    return new UserModel("twitch", {
      id: input["user-id"],
      name: input.username,
    });
  }
}
