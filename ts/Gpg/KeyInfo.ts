import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * Informaçõesa sobre uma chave GPG
 */
export class KeyInfo {
  /**
   * Faz um parse da saída do comando `gpg --list-keys`
   * @param output Output bruto do comando gpg
   */
  public static parse(output: IProcessExecutionOutput): KeyInfo[] {
    return [];
  }

  /**
   * Construtor.
   * @param output Saída do comando GPG para uma determinada chave.
   */
  public constructor(public readonly output?: string) {}
}
