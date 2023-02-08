import { ExtractFieldForKeyInfo } from '../ExtractField/ExtractFieldForKeyInfo';

/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Faz um parse da saída do comando `gpg --list-keys --keyid-format long`
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

      keyInfo.issued = ExtractFieldForKeyInfo.issued(block);
      keyInfo.thumbprint = ExtractFieldForKeyInfo.thumbprint(block);
      keyInfo.mainKeyId = ExtractFieldForKeyInfo.mainKeyId(block);
      keyInfo.mainKeyAlgorithm = ExtractFieldForKeyInfo.mainKeyAlgorithm(block);
      keyInfo.mainKeyLength = ExtractFieldForKeyInfo.mainKeyLength(block);
      keyInfo.mainKeyExpires = ExtractFieldForKeyInfo.mainKeyExpires(block);
      keyInfo.subKeyId = ExtractFieldForKeyInfo.subKeyId(block);
      keyInfo.subKeyAlgorithm = ExtractFieldForKeyInfo.subKeyAlgorithm(block);
      keyInfo.subKeyLength = ExtractFieldForKeyInfo.subKeyLength(block);
      keyInfo.subKeyExpires = ExtractFieldForKeyInfo.subKeyExpires(block);
      keyInfo.nameReal = ExtractFieldForKeyInfo.nameReal(block);
      keyInfo.nameEmail = ExtractFieldForKeyInfo.nameEmail(block);

      result.push(keyInfo);
    }

    return result;
  }

  /**
   * Data de emissão.
   */
  public issued?: Date;

  /**
   * Thumbprint da chave.
   */
  public thumbprint?: string;

  /**
   * Id da chave principal
   */
  public mainKeyId?: string;

  /**
   * Algoritmo da chave principal.
   */
  public mainKeyAlgorithm?: string;

  /**
   * Tamanho da chave principal.
   */
  public mainKeyLength?: number;

  /**
   * Data de expiração da chave principal.
   */
  public mainKeyExpires?: Date;

  /**
   * Id da sub chave
   */
  public subKeyId?: string;

  /**
   * Algoritmo da sub chave.
   */
  public subKeyAlgorithm?: string;

  /**
   * Tamanho da sub chave.
   */
  public subKeyLength?: number;

  /**
   * Data de expiração da sub chave.
   */
  public subKeyExpires?: Date;

  /**
   * Nome da pessoa.
   */
  public nameReal?: string;

  /**
   * Email da pessoa.
   */
  public nameEmail?: string;
}
