import { IBusMessage } from "./BusMessage/IBusMessage";

/**
 * Valida o conteúdo de campos nas mensagens do Bus.
 */
export class FieldValidator {
  /**
   * Campo: channels
   * @param instance Instância.
   */
  public static channels(instance: unknown): boolean {
    const fieldValue = FieldValidator.getField(instance, "channels");

    return (
      typeof fieldValue === "string" ||
      fieldValue instanceof RegExp ||
      (Array.isArray(fieldValue) &&
        fieldValue.findIndex(
          (channel) =>
            typeof channel !== "string" && !(channel instanceof RegExp)
        ) < 0)
    );
  }

  /**
   * Campo: id
   * @param instance Instância.
   */
  public static id(instance: unknown): boolean {
    const fieldValue = FieldValidator.getField(instance, "id");
    const regexMd5 = /^[0-9a-f]{32}$/;

    return typeof fieldValue === "string" && regexMd5.test(fieldValue);
  }

  /**
   * Campo: type
   * @param instance Instância.
   * @param type Tipo
   */
  public static type<T extends IBusMessage>(
    instance: unknown,
    type: new (...args: any[]) => T
  ): boolean {
    const fieldValue = FieldValidator.getField(instance, "type");

    return typeof fieldValue === "string" && fieldValue === type.name;
  }

  /**
   * Retorna o valor de um atributo na instância, se existir.
   * @param instance Isntâncias.
   * @param field Nome do campo.
   * @private
   */
  private static getField(
    instance: unknown,
    field: string
  ): undefined | unknown {
    if (typeof instance !== "object" || instance === null) {
      return undefined;
    }

    const instanceAsRecord = instance as Record<string, unknown>;

    return instanceAsRecord[field];
  }
}
