import { ExtractFieldForListKeys } from '../ExtractField/ExtractFieldForListKeys';

/**
 * Parâmetro de saída para: --list-keys
 */
export class ListKeysOutput {
  /**
   * Faz um parse da saída do comando `gpg --list-keys --keyid-format long`
   * @param output Output bruto do comando gpg
   */
  public static parse(output: string): ListKeysOutput[] {
    const result: ListKeysOutput[] = [];

    const regexEmptyLine = /(\r\n|\n\r|\r|\n)\s*\1/;
    const blocks = output.split(regexEmptyLine);
    for (const block of blocks) {
      if (!block.trim()) {
        continue;
      }

      const keyInfo = new ListKeysOutput();

      keyInfo.issued = ExtractFieldForListKeys.issued(block);
      keyInfo.thumbprint = ExtractFieldForListKeys.thumbprint(block);
      keyInfo.mainKeyId = ExtractFieldForListKeys.mainKeyId(block);
      keyInfo.mainKeyAlgorithm =
        ExtractFieldForListKeys.mainKeyAlgorithm(block);
      keyInfo.mainKeyLength = ExtractFieldForListKeys.mainKeyLength(block);
      keyInfo.mainKeyExpires = ExtractFieldForListKeys.mainKeyExpires(block);
      keyInfo.subKeyId = ExtractFieldForListKeys.subKeyId(block);
      keyInfo.subKeyAlgorithm = ExtractFieldForListKeys.subKeyAlgorithm(block);
      keyInfo.subKeyLength = ExtractFieldForListKeys.subKeyLength(block);
      keyInfo.subKeyExpires = ExtractFieldForListKeys.subKeyExpires(block);
      keyInfo.nameReal = ExtractFieldForListKeys.nameReal(block);
      keyInfo.nameEmail = ExtractFieldForListKeys.nameEmail(block);

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
