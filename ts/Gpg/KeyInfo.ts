/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Extrai o campo da saída do GPG: algoritmo.
   */
  private static extractFieldAlgorithm(output: string): string | undefined {
    const regexToExtract = /(?<=pub\s+)\w+[a-zA-Z](?=\d+\s)/;

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
   * Extrai o campo da saída do GPG: thumbprint.
   */
  private static extractFieldThumbprint(output: string): string | undefined {
    const regexToExtract = /^\s+[0-9A-F]{20,}\s+$/m;

    const thumbprint = (regexToExtract.exec(output) ?? [])[0];

    if (thumbprint !== undefined) {
      return thumbprint.trim();
    }

    return undefined;
  }

  /**
   * Extrai o campo da saída do GPG: nome da pessoa
   */
  private static extractFieldFullName(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*]([^<]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
    }

    return undefined;
  }

  /**
   * Extrai o campo da saída do GPG: email da pessoa
   */
  private static extractFieldEmail(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*][^<]+<([^>]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
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
      keyInfo.thumbprint = KeyInfo.extractFieldThumbprint(block);
      keyInfo.fullName = KeyInfo.extractFieldFullName(block);
      keyInfo.email = KeyInfo.extractFieldEmail(block);

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

  /**
   * Thumbprint da chave.
   */
  public thumbprint?: string;

  /**
   * Nome da pessoa.
   */
  public fullName?: string;

  /**
   * Email da pessoa.
   */
  public email?: string;
}
