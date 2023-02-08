import { ExtractFieldForGenerateKey } from '../ExtractField/ExtractFieldForGenerateKey';

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

    result.thumbprint = ExtractFieldForGenerateKey.thumbprint(output);
    result.mainKeyId = ExtractFieldForGenerateKey.mainKeyId(output);
    result.mainKeyAlgorithm =
      ExtractFieldForGenerateKey.mainKeyAlgorithm(output);
    result.subKeyId = ExtractFieldForGenerateKey.subKeyId(output);
    // TODO: Completar com os demais campos

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
   * Id da sub-chave
   */
  public subKeyId?: string;

  /**
   * Algoritmo da sub-chave.
   */
  public subKeyAlgorithm?: string;

  /**
   * Tamanho da sub-chave.
   */
  public subKeyLength?: number;
}
