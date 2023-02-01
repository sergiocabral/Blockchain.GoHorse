/**
 * Extrai os campos de uma saída da aplicação gpg
 */
export class GpgExtractField {
  /**
   * Nome do algoritmo.
   */
  public static keyAlgorithm(output: string): string | undefined {
    const regexToExtract = /pub\s+(\w+[a-zA-Z])\d+/;
    const extracted = regexToExtract.exec(output);

    if (extracted !== null && extracted.length === 2) {
      return extracted[1];
    }

    return undefined;
  }

  /**
   * Tamanho da chave em bits.
   */
  public static keySize(output: string): number | undefined {
    const regexToExtract = /(?<=pub\s+\w+[a-zA-Z])\d+(?=\s)/;

    const value = (regexToExtract.exec(output) ?? [])[0];
    if (value !== undefined) {
      return Number(value);
    }

    return undefined;
  }

  /**
   * Data de emissão da chave.
   */
  public static keyIssued(output: string): Date | undefined {
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
   * Data de expiração da chave.
   */
  public static keyExpires(output: string): Date | undefined {
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
   * Thumbprint da chave pública.
   */
  public static keyThumbprint(output: string): string | undefined {
    const regexToExtract = /^\s+[0-9A-F]{20,}\s+$/m;

    const thumbprint = (regexToExtract.exec(output) ?? [])[0];

    if (thumbprint !== undefined) {
      return thumbprint.trim();
    }

    return undefined;
  }

  /**
   * Nome da pessoa proprietária da chave.
   */
  public static keyOwnerName(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*]([^<]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
    }

    return undefined;
  }

  /**
   * Email da pessoa proprietária da chave.
   */
  public static keyOwnerEmail(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*][^<]+<([^>]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
    }

    return undefined;
  }
}
