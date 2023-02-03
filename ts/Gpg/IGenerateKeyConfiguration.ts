import { GpgKeyType } from './GpgKeyType';

/**
 * Parâmetrode entrada para gerar uma chave GPG
 */
export interface IGenerateKeyConfiguration {
  /**
   * Algoritmo da chave principal.
   */
  mainKeyType: GpgKeyType;

  /**
   * Tamanho da chave principal.
   */
  mainKeyLength: number;

  /**
   * Algoritmo da sub chave.
   */
  subKeyType: GpgKeyType;

  /**
   * Tamanho da sub chave.
   */
  subKeyLength: number;

  /**
   * Nome da pessoa.
   */
  nameReal: string;

  /**
   * Endereço do email
   */
  nameEmail: string;

  /**
   * Comentário opcional relacionado a pessoa.
   */
  nameComment?: string;

  /**
   * Data de expiração.
   */
  expires: Date;

  /**
   * Senha opcional.
   */
  passphrase?: string;
}
