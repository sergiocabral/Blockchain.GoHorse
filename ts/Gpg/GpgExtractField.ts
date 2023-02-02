/**
 * Extrai os campos de uma saída da aplicação gpg
 */
export class GpgExtractField {
  /**
   * Data de emissão das chaves.
   */
  public static issued(output: string): Date | undefined {
    const regexToExtract =
      /pub\s+.*?(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

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
   * Thumbprint.
   */
  public static thumbprint(output: string): string | undefined {
    const regexToExtract = /^\s+[0-9A-F]{20,}\s+$/m;

    const value = (regexToExtract.exec(output) ?? [])[0];

    if (value !== undefined) {
      return value.trim();
    }

    return undefined;
  }

  /**
   * Id da chave principal
   */
  public static mainKeyId(output: string): string | undefined {
    const regexToExtract = /pub\s+\w+[a-zA-Z]\d+\W([0-9A-F]+)/;
    const extracted = regexToExtract.exec(output);

    if (extracted !== null && extracted.length === 2) {
      return extracted[1];
    }

    return undefined;
  }

  /**
   * Nome do algoritmo da chave principal.
   */
  public static mainKeyAlgorithm(output: string): string | undefined {
    const regexToExtract = /pub\s+(\w+[a-zA-Z])\d+/;
    const extracted = regexToExtract.exec(output);

    if (extracted !== null && extracted.length === 2) {
      return extracted[1];
    }

    return undefined;
  }

  /**
   * Tamanho da chave principal.
   */
  public static mainKeyLength(output: string): number | undefined {
    const regexToExtract = /pub\s+\w+[a-zA-Z](\d+)\W/;
    const extracted = regexToExtract.exec(output);

    if (extracted !== null && extracted.length === 2) {
      const asNumber = Number(extracted[1]);
      if (Number.isFinite(asNumber)) {
        return Number(extracted[1]);
      }
    }

    return undefined;
  }

  /**
   * Data de expiração da chave principal.
   */
  public static mainKeyExpires(output: string): Date | undefined {
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
   * Id da sub chave
   */
  public static subKeyId(output: string): string | undefined {
    const regexToExtract = /sub\s+\w+[a-zA-Z]\d+\W([0-9A-F]+)/;
    const extracted = regexToExtract.exec(output);

    if (extracted !== null && extracted.length === 2) {
      return extracted[1];
    }

    return undefined;
  }

  /**
   * Nome da pessoa.
   */
  public static nameReal(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*]([^<]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
    }

    return undefined;
  }

  /**
   * Email da pessoa.
   */
  public static nameEmail(output: string): string | undefined {
    const regexToExtract = /^uid\s+\[[^\]]*][^<]+<([^>]+)/m;

    const valueExtracted = regexToExtract.exec(output);

    if (valueExtracted !== null && valueExtracted.length === 2) {
      return valueExtracted[1].trim();
    }

    return undefined;
  }
}
