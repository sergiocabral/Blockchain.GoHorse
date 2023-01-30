import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';
import { InvalidExecutionError } from '@sergiocabral/helper';
import { KeyInfo } from './KeyInfo';

/**
 * ProcessExecution para executar o GPG.
 */
export class GpgWrapper extends ApplicationWrapper {
  /**
   * Caminho da aplicação.
   */
  public override readonly path = 'gpg';

  /**
   * Determina se o Git está instalado.
   */
  public async isInstalled(): Promise<boolean> {
    try {
      const version = await this.getVersion();
      const regexValidVersion = /^\d+\.\d+\.\d+/;
      return regexValidVersion.test(version);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter versão do Git.
   */
  public async getVersion(): Promise<string> {
    const output = await super.run('--version');

    if (!this.isSuccess(output)) {
      throw new InvalidExecutionError(
        'Gpg exit code did not result in success: ' + String(output.exitCode)
      );
    }

    const regexExtractVersion = /\d[\w.-]+\w/;
    const version = output.all.match(regexExtractVersion);
    if (version?.length !== 1) {
      throw new InvalidExecutionError(
        'Gpg output was different than expected and unable to extract version value: ' +
          output.all
      );
    }

    return version[0];
  }

  /**
   * Obter versão do Git.
   */
  public async listKeys(): Promise<KeyInfo[]> {
    const output = await super.run('--list-keys');

    if (!this.isSuccess(output)) {
      throw new InvalidExecutionError(
        'Gpg exit code did not result in success: ' + String(output.exitCode)
      );
    }

    return KeyInfo.parse(output.all);
  }
}
