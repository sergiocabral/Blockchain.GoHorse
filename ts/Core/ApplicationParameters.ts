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
import { Generate } from '@gohorse/npm-core';
import { IApplicationParameters } from './IApplicationParameters';

/**
 * Parâmetros de execução da aplicação.
 */
export class ApplicationParameters
  extends CommandLine
  implements IApplicationParameters
{
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
      'Application "{applicationName}" v{applicationVersion}',
      {
        applicationName: this.applicationName,
        applicationVersion: this.applicationVersion
      },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Initial directory as: {directoryPath}',
      { directoryPath: this.inicialDirectory },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Application directory as: {directoryPath}',
      { directoryPath: this.applicationDirectory },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Command line: {commandLineContent}',
      { commandLineContent: this.toString() },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );
  }

  /**
   * Diretório da aplicação.
   */
  public static readonly applicationDirectory: string = path.dirname(
    HelperFileSystem.findFilesOut(__dirname, 'package.json', 1)[0]
  );

  /**
   * Diretório da aplicação.
   */
  public get applicationDirectory(): string {
    return ApplicationParameters.applicationDirectory;
  }

  /**
   * Diretório inicial de execução da aplicação.
   */
  public static readonly inicialDirectory: string = fs.realpathSync(
    process.cwd()
  );

  /**
   * Diretório inicial de execução da aplicação.
   */
  public get inicialDirectory(): string {
    return ApplicationParameters.inicialDirectory;
  }

  /**
   * Identificador para a instância da aplicação atualmente em execução.
   */
  public static readonly applicationId: string = Generate.id('i');

  /**
   * Identificador para a instância da aplicação atualmente em execução.
   */
  public get applicationId(): string {
    return ApplicationParameters.applicationId;
  }

  /**
   * Data e hora da execução
   */
  public readonly startupTime = new Date();

  /**
   * Nome a aplicação.
   */
  public static get applicationName(): string {
    if (ApplicationParameters.packageJson.name === undefined) {
      throw new InvalidDataError('Cannot found application name');
    }
    const regexContextAndName = /(@[^/]+|^)\/?(.*)/;
    const matches =
      ApplicationParameters.packageJson.name.match(regexContextAndName);
    return matches?.length === 3
      ? matches[2].slugify()
      : ApplicationParameters.packageJson.name.slugify();
  }

  /**
   * Nome a aplicação.
   */
  public get applicationName(): string {
    return ApplicationParameters.applicationName;
  }

  /**
   * Versão da aplicação.
   */
  public static get applicationVersion(): string {
    if (ApplicationParameters.packageJson.version === undefined) {
      throw new InvalidDataError('Cannot found application version');
    }
    return ApplicationParameters.packageJson.version;
  }

  /**
   * Versão da aplicação.
   */
  public get applicationVersion(): string {
    return ApplicationParameters.applicationVersion;
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
  public get applicationFlagFile(): string {
    return ApplicationParameters.getApplicationFlagFile(this.applicationId);
  }

  /**
   * Constrói o nome do arquivo de sinalização.
   * @param id Identificador.
   */
  public static getApplicationFlagFile(id: string) {
    const name = `${Definition.ENVIRONMENT_FILE_PREFIX}.${ApplicationParameters.applicationName}.${id}.${Definition.APPLICATION_FLAG_FILE_SUFFIX}`;
    return path.join(ApplicationParameters.inicialDirectory, name);
  }

  /**
   * Determina se um arquivo é um sinalizador de execução.
   * Armazena o id no primeiro grupo;
   */
  public static readonly regexApplicationFlagFileId: RegExp = new RegExp(
    HelperText.escapeRegExp(
      `${Definition.ENVIRONMENT_FILE_PREFIX}.${ApplicationParameters.applicationName}.`
    ) +
      '([^\\W_]+)' +
      HelperText.escapeRegExp(`.${Definition.APPLICATION_FLAG_FILE_SUFFIX}`) +
      '$'
  );

  /**
   * Extrai o id de um  arquivo é um sinalizador de execução.
   */
  public static getApplicationFlagFileId(filePath: string): string | undefined {
    const regexMatch =
      ApplicationParameters.regexApplicationFlagFileId.exec(filePath);
    if (regexMatch && regexMatch.length > 1) {
      return regexMatch[1];
    }
    return undefined;
  }

  /**
   * package.json da aplicação.
   */
  private static packageJsonValue?: IPackageJson;

  /**
   * Nome da aplicação a ser executada.
   */
  public static get packageJson(): IPackageJson {
    if (ApplicationParameters.packageJsonValue === undefined) {
      const mark = /^@gohorse\//;
      const applications = HelperNodeJs.getAllPreviousPackagesJson(
        ApplicationParameters.applicationDirectory
      ).filter(packageJson =>
        HelperText.matchFilter(String(packageJson.Value.name), mark)
      );
      if (applications.length !== 1) {
        throw new InvalidDataError(
          `Expected one package.json but found ${applications.length}.`
        );
      }
      ApplicationParameters.packageJsonValue = applications[0].Value;
    }
    return ApplicationParameters.packageJsonValue;
  }

  /**
   * Nome da aplicação a ser executada.
   */
  public get packageJson(): IPackageJson {
    return ApplicationParameters.packageJson;
  }
}
