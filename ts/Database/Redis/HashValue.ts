import md5 from "md5";

/**
 * Representa uma valor para gravação como hash.
 */
export class HashValue {
  /**
   * Decodifica de string para o valor original.
   * @param content Conteúdo.
   */
  public static decode<TResult = unknown>(content: string): TResult {
    return JSON.parse(content) as TResult;
  }

  /**
   * Formata o id para um determinado valor.
   * @param value Valor de entrada.
   */
  public static format(value: unknown): HashValue {
    let id: string | undefined;

    if (typeof value === "object" && value) {
      const tryId = (value as Record<string, unknown>).id;
      if (typeof tryId === "string") {
        id = tryId;
      }
    } else if (typeof value === "string" && HashValue.regexMd5.test(value)) {
      id = value;
    }

    if (id === undefined) {
      id = md5(String(value));
    }

    return {
      content: JSON.stringify(value),
      id,
    };
  }

  /**
   * Regex para validar um valor de hash MD5.
   */
  private static readonly regexMd5 = /^[0-9a-f]{32}$/;

  /**
   * Conteúdo.
   */
  public content = "";

  /**
   * Identificador.
   */
  public id = "";
}
