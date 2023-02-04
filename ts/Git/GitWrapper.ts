import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';
import { InvalidExecutionError } from '@sergiocabral/helper';
import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * ProcessExecution para executar o Git.
 */
export class GitWrapper extends ApplicationWrapper {
  /**
   * Monta a mensagem de erro (se houver) com base no output.
   * @param output Saída do Git.
   */
  protected override errorMessage(
    output: IProcessExecutionOutput
  ): string | undefined {
    return (
      super.errorMessage(output) ??
      (!output.all.startsWith('fatal:')
        ? undefined
        : `Git resulted in a fatal error. Exit code: ${String(
            output.exitCode
          )}`)
    );
  }

  /**
   * Caminho da aplicação.
   */
  public override readonly path = 'git';

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

    const errorMessage = this.errorMessage(output);
    if (errorMessage !== undefined) {
      throw new InvalidExecutionError(errorMessage);
    }

    const regexExtractVersion = /\d[\w.-]+\w/;
    const version = output.all.match(regexExtractVersion);
    if (version?.length !== 1) {
      throw new InvalidExecutionError(
        'Git output was different than expected and unable to extract version value: ' +
          output.all
      );
    }

    return version[0];
  }

  /**
   * Determina se é um repositório válido.
   */
  public async isValidRepository(): Promise<boolean> {
    const output = await super.run('status');
    return this.errorMessage(output) === undefined;
  }

  /**
   * Cria um repositório.
   * @param bare Sinaliza se é do tipo bare (sem árvore de arquivos)
   */
  public async createRepository(bare = false): Promise<boolean> {
    const args: string[] = ['init'];
    if (bare) {
      args.push('--bare');
    }
    const output = await super.run(...args);
    return this.errorMessage(output) === undefined;
  }

  /**
   * Adiciona arquivos no staging area.
   * @param files Lista de arquivos.
   */
  public async addFiles(...files: string[]): Promise<boolean> {
    const args: string[] = ['add'].concat(files);
    const output = await super.run(...args);
    return this.errorMessage(output) === undefined;
  }

  /**
   * Commit.
   * @param message Mensagem
   * @param gpgSignature Assinatura GPG/PGP
   */
  public async commit(
    message?: string,
    gpgSignature?: string
  ): Promise<boolean> {
    const args: string[] = ['commit'];
    args.push(`--allow-empty`);
    if (gpgSignature !== undefined) {
      args.push(`-S${gpgSignature}`);
    }
    if (message) {
      args.push(`-m`);
      args.push(message);
    } else {
      args.push('--allow-empty-message');
      args.push('--no-edit');
    }
    const output = await super.run(...args);
    return this.errorMessage(output) === undefined;
  }
}
