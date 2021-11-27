import { HelperObject, JsonLoader } from "@sergiocabral/helper";

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
  public username = "twitch_user_name";

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    let fieldName = "token";
    let value = HelperObject.getProperty(this, fieldName);
    const regexValidToken = /^oauth:[a-z0-9]{30}$/;
    if (typeof value !== "string" || !regexValidToken.test(value)) {
      errors.push(
        `${
          this.constructor.name
        }.${fieldName} must be a valid Twitch token, for example "${
          new TwitchAuthConfiguration().token
        }", but found: ${typeof value}, ${String(value)}`
      );
    }

    fieldName = "username";
    value = HelperObject.getProperty(this, fieldName);
    const regexValidUsername = /^\w+$/;
    if (typeof value !== "string" || !regexValidUsername.test(value)) {
      errors.push(
        `${
          this.constructor.name
        }.${fieldName} must be a valid Twitch username with letters, numbers and underscore, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    errors.push(...super.errors());

    return errors;
  }
}
