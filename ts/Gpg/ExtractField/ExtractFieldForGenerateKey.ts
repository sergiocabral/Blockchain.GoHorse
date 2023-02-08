/**
 * Extrai campos para da saída de: --generate-key
 */
export class ExtractFieldForGenerateKey {
  /**
   * Extrai a linha com informações da chves.
   * @param output Resultado de saída do GPG.
   * @param key Qual chave vai localizar.
   */
  private static lineOfKey(
    output: string,
    key: 'main' | 'sub'
  ): Record<string, string> {
    const regexToExtract =
      /^gpg: (?<algorithmType>\w+)\/(?<hashType>\w+) signature from: "(?<keyId>[0-9A-F]+)[^"]+".*$/gm;

    const firstCapture = regexToExtract.exec(output);

    if (key === 'main' && firstCapture?.groups) {
      return firstCapture.groups;
    }

    if (firstCapture?.groups) {
      let lastCapture: RegExpExecArray | null;
      while (
        null !== (lastCapture = regexToExtract.exec(output)) &&
        lastCapture.groups
      ) {
        if (
          lastCapture.length > 1 &&
          lastCapture.groups['keyId'] !== firstCapture.groups['keyId']
        ) {
          return lastCapture.groups;
        }
      }
    }

    return {};
  }

  /**
   * Thumbprint.
   */
  public static thumbprint(output: string): string | undefined {
    const regexToExtract = /\/([0-9A-Z]{20,})\.rev/m;

    const value = (regexToExtract.exec(output) ?? [])[1];

    if (value !== undefined) {
      return value.trim();
    }

    return undefined;
  }

  /**
   * Id da chave principal
   */
  public static mainKeyId(output: string): string | undefined {
    const mainKeyLine = ExtractFieldForGenerateKey.lineOfKey(output, 'main');
    return mainKeyLine['keyId'];
  }

  /**
   * Nome do algoritmo da chave principal
   */
  public static mainKeyAlgorithm(output: string): string | undefined {
    const mainKeyLine = ExtractFieldForGenerateKey.lineOfKey(output, 'main');
    return mainKeyLine['algorithmType'];
  }

  /**
   * Id da sub-chave
   */
  public static subKeyId(output: string): string | undefined {
    const mainKeyLine = ExtractFieldForGenerateKey.lineOfKey(output, 'sub');
    return mainKeyLine['keyId'];
  }
}
