import { GpgExtractField } from './GpgExtractField';

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

    const regexEmptyLine = /(\r\n|\n\r|\r|\n)\s*\1/;
    const blocks = output.split(regexEmptyLine);
    for (const block of blocks) {
      if (!block.trim()) {
        continue;
      }

      const keyInfo = new KeyInfo();

      keyInfo.keyAlgorithm = GpgExtractField.keyAlgorithm(block);
      keyInfo.keySize = GpgExtractField.keySize(block);
      keyInfo.keyIssued = GpgExtractField.keyIssued(block);
      keyInfo.keyExpires = GpgExtractField.keyExpires(block);
      keyInfo.mainKeyId = GpgExtractField.mainKeyId(block);
      keyInfo.subKeyId = GpgExtractField.subKeyId(block);
      keyInfo.keyThumbprint = GpgExtractField.keyThumbprint(block);
      keyInfo.ownerName = GpgExtractField.keyOwnerName(block);
      keyInfo.ownerEmail = GpgExtractField.keyOwnerEmail(block);

      result.push(keyInfo);
    }

    return result;
  }

  /**
   * Algoritmo.
   */
  public keyAlgorithm?: string;

  /**
   * Tamanho da chave.
   */
  public keySize?: number;

  /**
   * Data de emissão.
   */
  public keyIssued?: Date;

  /**
   * Data de expiração.
   */
  public keyExpires?: Date;

  /**
   * Thumbprint da chave.
   */
  public keyThumbprint?: string;

  /**
   * Id da chave principal
   */
  public mainKeyId?: string;

  /**
   * Id da sub chave
   */
  public subKeyId?: string;

  /**
   * Nome da pessoa.
   */
  public ownerName?: string;

  /**
   * Email da pessoa.
   */
  public ownerEmail?: string;
}
