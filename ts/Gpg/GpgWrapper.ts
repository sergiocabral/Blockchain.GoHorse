import { ApplicationWrapper } from '../Wrapper/ApplicationWrapper';
import { HelperFileSystem, InvalidExecutionError } from '@sergiocabral/helper';
import { KeyInfo } from './KeyInfo';
import { IGenerateKeyOutput } from './IGenerateKeyOutput';
import { IGenerateKeyConfiguration } from './IGenerateKeyConfiguration';
import * as fs from 'fs';
import * as path from 'path';
import { GpgFieldHelper } from './GpgFieldHelper';
import { IProcessExecutionOutput } from '../ProcessExecution/IProcessExecutionOutput';

/**
 * ProcessExecution para executar o GPG.
 */
export class GpgWrapper extends ApplicationWrapper {
  /**
   * Monta a mensagem de erro (se houver) com base no output.
   * @param output Saída do GPG.
   */
  protected override errorMessage(
    output: IProcessExecutionOutput
  ): string | undefined {
    return output.exitCode === 0
      ? undefined
      : `GPG exit code did not result in success: ${String(output.exitCode)}`;
  }

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

    const errorMessage = this.errorMessage(output);
    if (errorMessage !== undefined) {
      throw new InvalidExecutionError(errorMessage);
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
    const output = await super.run('--list-keys', '--keyid-format', 'long');

    const errorMessage = this.errorMessage(output);
    if (errorMessage !== undefined) {
      throw new InvalidExecutionError(errorMessage);
    }

    return KeyInfo.parse(output.all);
  }

  /**
   * Cria um par de chave no GPG
   */
  public async generateKey(
    configuration: IGenerateKeyConfiguration
  ): Promise<IGenerateKeyOutput> {
    const tempDirectoryName = `_temp-gpg${Math.random()}.tmp`.replace(
      '0.',
      '-'
    ); // TODO: Usar @sergiocabral/helper random
    fs.mkdirSync(tempDirectoryName);
    const tempDirectoryPath = fs.realpathSync(tempDirectoryName);

    const input = new Map<string, string | undefined>();
    input.set('Key-Type', configuration.mainKeyType);
    input.set('Key-Length', configuration.mainKeyLength.toFixed(0));
    input.set('Subkey-Type', configuration.subKeyType);
    input.set('Subkey-Length', configuration.subKeyLength.toFixed(0));
    input.set('Name-Real', configuration.nameReal);
    input.set('Name-Email', configuration.nameEmail);
    input.set('Creation-Date', GpgFieldHelper.toDate(new Date()));
    input.set('Expire-Date', GpgFieldHelper.toDate(configuration.expires));

    if (configuration.passphrase) {
      input.set('Passphrase', configuration.passphrase);
    } else {
      input.set('%no-ask-passphrase', undefined);
      input.set('%no-protection', undefined);
    }

    if (configuration.nameComment) {
      input.set('Name-Comment', configuration.nameComment);
    }

    input.set('%commit', undefined);

    const inputFileName = path.join(tempDirectoryPath, 'gpg-batch');
    fs.writeFileSync(inputFileName, GpgFieldHelper.toBatchFile(input));

    const output = await super.run(
      '--verbose',
      '--batch',
      '--generate-key',
      inputFileName
    );

    HelperFileSystem.deleteRecursive(tempDirectoryPath);

    const errorMessage = this.errorMessage(output);
    if (errorMessage !== undefined) {
      throw new InvalidExecutionError(errorMessage);
    }

    return {
      // TODO: Preencher as informações de retorno.
      issued: new Date()
    };
  }
}
