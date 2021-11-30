import { HelperObject, JsonLoader } from "@sergiocabral/helper";

/**
 * Valida campos conhecidos em um JSON.
 */
export class JsonLoaderFieldErrors {
  /**
   * Sem erros para: valor como boolean
   */
  public static boolean(instance: JsonLoader, fieldName: string): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (typeof value !== "boolean") {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a boolean, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }

  /**
   * Sem erros para: valor como string ou não informado
   */
  public static canEmptyString(
    instance: JsonLoader,
    fieldName: string
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
   * Sem erros para: valor é uma lista (array) de determinado tipo.
   */
  public static list(
    instance: JsonLoader,
    fieldName: string,
    typeOf?: string
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);

    const isValid =
      Array.isArray(value) &&
      (typeOf === undefined ||
        value.findIndex((item) => typeof item !== typeOf) < 0);

    if (!isValid) {
      errors.push(
        `${instance.constructor.name}.${fieldName} must be a array of ${
          typeOf ?? "any"
        }, but found: ${typeof value}, ${String(value)}`
      );
    }

    return errors;
  }

  /**
   * Sem erros para: string não é vazia
   */
  public static notEmptyString(
    instance: JsonLoader,
    fieldName: string
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

  /**
   * Sem erros para: número entre dois valores
   */
  public static numberBetween(
    instance: JsonLoader,
    fieldName: string,
    validValues: [number, number],
    type: "integer" | "decimal"
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    const minValue = validValues[0];
    const maxValue = validValues[1];
    if (
      typeof value !== "number" ||
      value < minValue ||
      value > maxValue ||
      (type === "integer" && Math.floor(value) !== value)
    ) {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a ${type} number between ${minValue} and ${maxValue}, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }

  /**
   * Sem erros para: número não informado ou entre dois valores
   */
  public static numberEmptyOrBetween(
    instance: JsonLoader,
    fieldName: string,
    validValues: [number, number],
    type: "integer" | "decimal"
  ): string[] {
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    const minValue = validValues[0];
    const maxValue = validValues[1];
    if (value !== undefined && value !== null) {
      if (
        typeof value !== "number" ||
        value < minValue ||
        value > maxValue ||
        (type === "integer" && Math.floor(value) !== value)
      ) {
        errors.push(
          `${
            instance.constructor.name
          }.${fieldName} must be null, undefined or a ${type} number between ${minValue} and ${maxValue}, but found: ${typeof value}, ${String(
            value
          )}`
        );
      }
    }

    return errors;
  }

  /**
   * Sem erros para: valor presente na lista
   */
  public static onTheList(
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
   * Sem erros para: valor é um UUID válido.
   */
  public static uuid(instance: JsonLoader, fieldName: string): string[] {
    const regexUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const errors = Array<string>();
    const value = HelperObject.getProperty(instance, fieldName);
    if (!(typeof value === "string" && regexUuid.test(value))) {
      errors.push(
        `${
          instance.constructor.name
        }.${fieldName} must be a valid UUID, but found: ${typeof value}, ${String(
          value
        )}`
      );
    }

    return errors;
  }
}
