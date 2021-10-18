import { HelperObject, JsonLoader } from "@sergiocabral/helper";

import { JsonLoaderFieldErrors } from "../Core/JsonLoaderFieldErrors";

/**
 * Informações de login na Twitch.
 */
export class TwitchAuthConfiguration extends JsonLoader {
  /**
   * Token de acesso do usuário da Twitch.
   */
  public token = "oauth:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5";

  /**
   * Usuário da Twitch.
   */
  public user = "twitch_user_name";

  /**
   * Lista de erros presentes na configuração atual
   */
  public errors(): string[] {
    const errors = Array<string>();

    errors.push(...JsonLoaderFieldErrors.notEmptyString(this, "user"));

    const fieldName = "token";
    const regexValidToken = /^oauth:[a-z0-9]{30}$/;
    const value = HelperObject.getProperty(this, fieldName);
    if (typeof value !== "string" || !regexValidToken.test(value)) {
      errors.push(
        `${
          this.constructor.name
        }.${fieldName} must be a valid Twitch Token, for example "${
          new TwitchAuthConfiguration().token
        }", but found: ${typeof value}, ${String(value)}`
      );
    }
    errors.push(...super.errors());

    return errors;
  }
}
