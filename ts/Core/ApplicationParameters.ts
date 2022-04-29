import {
  CommandLine,
  HelperFileSystem,
  HelperNodeJs,
  HelperText,
  InvalidDataError,
  IPackageJson,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import path from 'path';
import fs from 'fs';
import { Definition } from '../Definition';
import { Application } from './Application';

/**
 * Parâmetros de execução da aplicação.
 */
export class ApplicationParameters extends CommandLine {
  /**
   * Contexto do log.
   */
  private static logContext = 'ApplicationParameters';

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

    Logger.post(
      'Application name: {applicationName}',
      { applicationName: this.applicationName },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Initial directory as: {inicialDirectory}',
      { inicialDirectory: this.inicialDirectory },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Application directory as: {applicationDirectory}',
      { applicationDirectory: this.applicationDirectory },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Command line: {commandLine}',
      { commandLine: this.toString() },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    this.regexRunningFlagFileId = new RegExp(
      HelperText.escapeRegExp(
        `${Definition.ENVIRONMENT_FILE_PREFIX}.${this.applicationName}.`
      ) +
        '([^\\W_]+)' +
        HelperText.escapeRegExp(`.${Definition.RUNNING_FILE_SUFFIX}`) +
        '$'
    );
  }

  /**
   * Diretório da aplicação.
   */
  public readonly applicationDirectory: string = path.dirname(
    HelperFileSystem.findFilesOut(__dirname, 'package.json', 1)[0]
  );

  /**
   * Diretório inicial de execução da aplicação.
   */
  public readonly inicialDirectory: string = fs.realpathSync(process.cwd());

  /**
   * Identificador para a instância da aplicação atualmente em execução.
   */
  public get applicationInstanceIdentifier(): string {
    return Application.applicationInstanceIdentifier;
  }

  /**
   * Data e hora da execução
   */
  public readonly startupTime = new Date();

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
   * Caminho do arquivo que sinaliza que a aplicação está em execução.
   */
  public get runningFlagFile(): string {
    return this.getRunningFlagFile(this.applicationInstanceIdentifier);
  }

  /**
   * Constrói o nome do arquivo de sinalização.
   * @param id Identificador.
   */
  public getRunningFlagFile(id: string) {
    const name = `${Definition.ENVIRONMENT_FILE_PREFIX}.${this.applicationName}.${id}.${Definition.RUNNING_FILE_SUFFIX}`;
    return path.join(this.inicialDirectory, name);
  }

  /**
   * Determina se um arquivo é um sinalizador de execução.
   * Armazena o id no primeiro grupo;
   */
  public readonly regexRunningFlagFileId: RegExp;

  /**
   * Extrai o id de um  arquivo é um sinalizador de execução.
   */
  public getRunningFlagFileId(file: string): string | undefined {
    const regexMatch = this.regexRunningFlagFileId.exec(file);
    if (regexMatch && regexMatch.length > 1) {
      return regexMatch[1];
    }
    return undefined;
  }

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
      const applications = HelperNodeJs.getAllPreviousPackagesJson(
        this.applicationDirectory
      ).filter(packageJson =>
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
