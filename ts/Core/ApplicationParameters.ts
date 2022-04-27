import {
  CommandLine,
  HelperNodeJs,
  HelperText,
  InvalidDataError,
  IPackageJson
} from '@sergiocabral/helper';
import path from 'path';
import fs from 'fs';

/**
 * Parâmetros de execução da aplicação.
 */
export class ApplicationParameters extends CommandLine {
  /**
   * Construtor.
   * @param commandLine Argumentos da linha de comando.
   */
  constructor(commandLine: string | string[]) {
    super(Array.isArray(commandLine) ? commandLine.join(' ') : commandLine, {
      caseInsensitiveForName: true,
      caseInsensitiveForValue: false,
      attribution: '=',
      quotes: [
        ['"', '"'],
        ["'", "'"],
        ['`', '`'],
        ['´', '´']
      ]
    });
  }

  /**
   * Diretório inicial de execução da aplicação.
   */
  public readonly inicialDirectory: string = fs.realpathSync(process.cwd());

  /**
   * Identificador para a instância da aplicação atualmente em execução.
   */
  public readonly applicationInstanceIdentifier: string = Buffer.from(
    Math.random().toString()
  )
    .toString('base64')
    .replace(/[\W_]/g, '')
    .substring(10, 15);

  /**
   * Nome a aplicação.
   */
  public get applicationName(): string {
    if (this.packageJson.name === undefined) {
      throw new InvalidDataError('Cannot found application name');
    }
    const regexContextAndName = /(@[^/]+|^)\/?(.*)/;
    const matches = this.packageJson.name.match(regexContextAndName);
    return matches?.length === 3
      ? matches[2].slugify()
      : this.packageJson.name.slugify();
  }

  /**
   * Caminho do arquivo de configuração.
   */
  public get configurationFile(): string {
    const name = `env.${this.applicationName}.json`;
    return path.join(this.inicialDirectory, name);
  }

  /**
   * Consdtantes de uso local.
   */
  private static DEFINITION = {
    ENV: 'env',
    RUNNING: 'isRunning'
  };

  /**
   * Caminho do arquivo que sinaliza que a aplicação está em execução.
   */
  public get runningFlagFile(): string {
    const firstIdLetter = 'i';
    const name = `${ApplicationParameters.DEFINITION.ENV}.${this.applicationName}.${firstIdLetter}${this.applicationInstanceIdentifier}.${ApplicationParameters.DEFINITION.RUNNING}`;
    return path.join(this.inicialDirectory, name);
  }

  /**
   * Determina se um arquivo é um sinalizador de execução.
   * Armazena o id no primeiro grupo;
   */
  public readonly regexRunningFlagFileId: RegExp = new RegExp(
    HelperText.escapeRegExp(
      `${ApplicationParameters.DEFINITION.ENV}.${this.applicationName}.`
    ) +
      '([^\\W_]+)' +
      HelperText.escapeRegExp(`.${ApplicationParameters.DEFINITION.RUNNING}`) +
      '$'
  );

  /**
   * package.json da aplicação.
   */
  private packageJsonValue?: IPackageJson;

  /**
   * Nome da aplicação a ser executada.
   */
  public get packageJson(): IPackageJson {
    if (this.packageJsonValue === undefined) {
      const mark = /^@gohorse\//;
      const applications = HelperNodeJs.getAllPreviousPackagesJson().filter(
        packageJson =>
          HelperText.matchFilter(String(packageJson.Value.name), mark)
      );
      if (applications.length !== 1) {
        throw new InvalidDataError(
          `Expected one package.json but found ${applications.length}.`
        );
      }
      this.packageJsonValue = applications[0].Value;
    }
    return this.packageJsonValue;
  }
}
