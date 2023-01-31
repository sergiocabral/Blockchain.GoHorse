/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Extrai o campo da saída do GPG: algoritmo.
   */
  private static extractFieldAlgorithm(output: string): string | undefined {
    const regexToExtract = /(?<=pub\s+)\w+(?=\s)/;

    return (regexToExtract.exec(output) ?? [])[0];
  }

  /**
   * Extrai o campo da saída do GPG: data de emissão.
   */
  private static extractFieldIssued(output: string): Date | undefined {
    const regexToExtract =
      /(?<=pub\s+\w+\s+)(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

    const timezoneOffset = new Date().getTimezoneOffset();

    const value = regexToExtract.exec(output);
    if (value !== null && value.length > 0 && value.groups !== undefined) {
      return new Date(
        Number(value.groups['year']),
        Number(value.groups['month']) - 1,
        Number(value.groups['day'])
      ).addMinutes(-timezoneOffset);
    }

    return undefined;
  }

  /**
   * Extrai o campo da saída do GPG: data de expiração.
   */
  private static extractFieldExpires(output: string): Date | undefined {
    const regexToExtract =
      /(?<=expires: )(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

    const timezoneOffset = new Date().getTimezoneOffset();

    const value = regexToExtract.exec(output);
    if (value !== null && value.length > 0 && value.groups !== undefined) {
      return new Date(
        Number(value.groups['year']),
        Number(value.groups['month']) - 1,
        Number(value.groups['day'])
      ).addMinutes(-timezoneOffset);
    }

    return undefined;
  }

  /**
   * Faz um parse da saída do comando `gpg --list-keys`
   * @param output Output bruto do comando gpg
   */
  public static parse(output: string): KeyInfo[] {
    const result: KeyInfo[] = [];

    const regexEmptyLine = /(\r\n|\n\r|\r|\n)\s*\1/;
    const blocks = output.split(regexEmptyLine);
    for (const block of blocks) {
      if (!block.trim()) {
        continue;
      }

      const keyInfo = new KeyInfo();

      keyInfo.algorithm = KeyInfo.extractFieldAlgorithm(block);
      keyInfo.issued = KeyInfo.extractFieldIssued(block);
      keyInfo.expires = KeyInfo.extractFieldExpires(block);

      result.push(keyInfo);
    }

    return result;
  }

  /**
   * Algoritmo.
   */
  public algorithm?: string;

  /**
   * Data de emissão.
   */
  public issued?: Date;

  /**
   * Data de expiração.
   */
  public expires?: Date;
}
