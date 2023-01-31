/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Extrai o campo da saída do GPG: expires.
   */
  private static extractFieldExpires(output: string): Date | undefined {
    const regexExtractExpires =
      /(?<=expires: )(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

    const timezoneOffset = new Date().getTimezoneOffset();

    const expires = regexExtractExpires.exec(output);
    if (
      expires !== null &&
      expires.length > 0 &&
      expires.groups !== undefined
    ) {
      return new Date(
        Number(expires.groups['year']),
        Number(expires.groups['month']) - 1,
        Number(expires.groups['day'])
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

    const blocks = output.split('\n');
    for (const block of blocks) {
      const keyInfo = new KeyInfo();

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
   * Data de expiração.
   */
  public expires?: Date;
}
