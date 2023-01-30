/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Faz um parse da saída do comando `gpg --list-keys`
   * @param output Output bruto do comando gpg
   */
  public static parse(output: string): KeyInfo[] {
    const result: KeyInfo[] = [];

    const regexExtractExpires =
      /(?<=expires: )(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

    const blocks = output.split('\n');
    for (const block of blocks) {
      const keyInfo = new KeyInfo();

      const expires = regexExtractExpires.exec(block);
      if (
        expires !== null &&
        expires.length > 0 &&
        expires.groups !== undefined
      ) {
        keyInfo.expires = new Date(
          Number(expires.groups['year']),
          Number(expires.groups['month']) - 1,
          Number(expires.groups['day'])
        );
        // TODO: Escrever na lib @sergiocabral/helper algo para remover o timezone.
      }

      result.push(keyInfo);
    }

    return result;
  }

  /**
   * Data de expiração.
   */
  public expires?: Date;
}
