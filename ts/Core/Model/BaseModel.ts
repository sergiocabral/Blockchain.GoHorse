import { InvalidDataError, JsonLoader } from "@sergiocabral/helper";

/**
 * Classe base para modelos de dados calculados dinamicamente com base no JSON.
 */
export abstract class BaseModel extends JsonLoader {
  /**
   * JSON carregado nesta instância.
   */
  protected get json(): Record<string, unknown> {
    return this as unknown as Record<string, unknown>;
  }

  /**
   * Obtem um valor do JSON.
   * @param fieldName Nome do campo.
   * @param filedValue Valor original do campo.
   * @param filedParsed Valor calculado para o campo.
   */
  protected getValue<TResult>(
    fieldName: string,
    filedValue: unknown,
    filedParsed: TResult | undefined
  ): TResult {
    if (filedParsed === undefined) {
      throw new InvalidDataError(
        'Invalid value for "{fieldName}": {filedValueType}, {filedValue}'.querystring(
          {
            fieldName,
            filedValue,
            filedValueType: typeof filedValue,
          }
        )
      );
    }

    return filedParsed;
  }
}
