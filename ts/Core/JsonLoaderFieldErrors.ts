import { HelperObject, JsonLoader } from "@sergiocabral/helper";

/**
 * Valida campos conhecidos em um JSON.
 */
export class JsonLoaderFieldErrors {
  /**
   * Verifica os erros em um campo tipo: lista estrita de valores texto.
   */
  public static listOfText(
    instance: JsonLoader,
    fieldName: string,
    validValues: string[]
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (typeof value !== "string" || !validValues.includes(value)) {
      errors.push(
        `${instance.constructor.name}.${fieldName} must be ${validValues
          .map((validValue) => `"${validValue}"`)
          .join(" or ")}, but found: ${typeof value}, ${String(value)}`
      );
    }

    return errors;
  }

  /**
   * Verifica os erros em um campo tipo: password.
   */
  public static password(
    instance: JsonLoader,
    fieldName: string = "password"
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (typeof value !== "string" && value !== undefined && value !== null) {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a string, null or undefined, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }

  /**
   * Verifica os erros em um campo tipo: porta de hostname.
   */
  public static port(
    instance: JsonLoader,
    fieldName: string = "port"
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (
      !(
        typeof value === "number" &&
        Number.isFinite(value) &&
        Math.floor(value) === value &&
        value > 0
      )
    ) {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a integer greater than zero, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }

  /**
   * Verifica os erros em um campo tipo: endereço do servidor.
   */
  public static server(
    instance: JsonLoader,
    fieldName: string = "server"
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (!(typeof value === "string" && value.length > 0)) {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a not empty string, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }
}
