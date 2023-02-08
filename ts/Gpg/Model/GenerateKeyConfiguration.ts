import { GpgKeyType } from '../GpgKeyType';
import { IGenerateKeyConfiguration } from './IGenerateKeyConfiguration';

/**
 * Parâmetrode entrada para gerar uma chave GPG
 */
export class GenerateKeyConfiguration implements IGenerateKeyConfiguration {
  /**
   * Construtor.
   * @param nameReal Nome da pessoa.
   * @param nameEmail Endereço do email.
   * @param expires Data de expiração.
   * @param nameComment Comentário opcional relacionado a pessoa.
   * @param passphrase Senha opcional.
   */
  public constructor(
    public readonly nameReal: string,
    public readonly nameEmail: string,
    public readonly expires: Date = new Date().addDays(365),
    public readonly nameComment?: string,
    public readonly passphrase?: string
  ) {}

  /**
   * Algoritmo da chave principal.
   */
  public readonly mainKeyType: GpgKeyType = GpgKeyType.Rsa;

  /**
   * Tamanho da chave principal.
   */
  public readonly mainKeyLength: number = 4096;

  /**
   * Algoritmo da sub chave.
   */
  public readonly subKeyType: GpgKeyType = GpgKeyType.Rsa;

  /**
   * Tamanho da sub chave.
   */
  public readonly subKeyLength: number = 4096;
}
