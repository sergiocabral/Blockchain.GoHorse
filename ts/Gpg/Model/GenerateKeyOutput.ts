import { ExtractFieldForListKeys } from '../ExtractField/ExtractFieldForListKeys';

/**
 * Parâmetro de saída para: --generate-key
 */
export class GenerateKeyOutput {
  /**
   * Faz um parse da saída do comando `gpg --verbose --generate-keys`
   * @param output Output bruto do comando gpg
   */
  public static parse(output: string): GenerateKeyOutput {
    const result: GenerateKeyOutput = {};

    result.thumbprint = ExtractFieldForListKeys.thumbprint(output);

    return result;
  }

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
}
