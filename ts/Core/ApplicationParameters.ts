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
   * @param id Identificador
   * @param startupTime Data e hora da execução
   * @param commandLine Argumentos da linha de comando.
   */
  constructor(
    public readonly id: string,
    public readonly startupTime: Date,
    commandLine: string | string[]
  ) {
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
        applicationName: this.packageName,
        applicationVersion: this.packageVersion
      },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Initial directory as: {directoryPath}',
      { directoryPath: this.startupDirectory },
      LogLevel.Debug,
      ApplicationParameters.logContext
    );

    Logger.post(
      'Application directory as: {directoryPath}',
      { directoryPath: this.packageDirectory },
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
   * Diretório de onde foi executado.
   */
  public get startupDirectory(): string {
    return ApplicationParameters.startupDirectory;
  }

  /**
   * Diretório de onde foi executado.
   */
  public static readonly startupDirectory: string = fs.realpathSync(
    process.cwd()
  );

  /**
   * Diretório do pacote npm.
   */
  public get packageDirectory(): string {
    return ApplicationParameters.packageDirectory;
  }

  /**
   * Diretório do pacote npm.
   */
  public static readonly packageDirectory: string = path.dirname(
    HelperFileSystem.findFilesOut(__dirname, 'package.json', 1)[0]
  );

  /**
   * Nome do pacote npm.
   */
  public get packageName(): string {
    return ApplicationParameters.packageName;
  }

  /**
   * Nome do pacote npm.
   */
  public static get packageName(): string {
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
   * Versão do pacote npm.
   */
  public get packageVersion(): string {
    return ApplicationParameters.packageVersion;
  }

  /**
   * Versão do pacote npm.
   */
  public static get packageVersion(): string {
    if (ApplicationParameters.packageJson.version === undefined) {
      throw new InvalidDataError('Cannot found application version');
    }
    return ApplicationParameters.packageJson.version;
  }

  /**
   * JSON do arquivo package.json do npm.
   */
  public get packageJson(): IPackageJson {
    return ApplicationParameters.packageJson;
  }

  /**
   * package.json da aplicação.
   */
  private static packageJsonValue?: IPackageJson;

  /**
   * JSON do arquivo package.json do npm.
   */
  public static get packageJson(): IPackageJson {
    if (ApplicationParameters.packageJsonValue === undefined) {
      const mark = /^@gohorse\//;
      const applications = HelperNodeJs.getAllPreviousPackagesJson(
        ApplicationParameters.packageDirectory
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
   * Caminho do arquivo de configuração.
   */
  public get configurationFile(): string {
    const name = `env.${this.packageName}.json`;
    return path.join(this.startupDirectory, name);
  }
  /**
   * Caminho do arquivo que sinaliza que a aplicação está em execução e
   * recebe mensagens de outras instâncias.
   */
  public get flagFile(): string {
    return ApplicationParameters.getFlagFile(this.id);
  }

  /**
   * Constrói o nome do arquivo de sinalização.
   * @param id Identificador.
   */
  public static getFlagFile(id: string) {
    const name = `${Definition.ENVIRONMENT_FILE_PREFIX}.${ApplicationParameters.packageName}.${id}.${Definition.APPLICATION_FLAG_FILE_SUFFIX}`;
    return path.join(ApplicationParameters.startupDirectory, name);
  }

  /**
   * Determina se um arquivo é um sinalizador de execução.
   * Armazena o id no primeiro grupo;
   */
  public static readonly regexFlagFileId: RegExp = new RegExp(
    HelperText.escapeRegExp(
      `${Definition.ENVIRONMENT_FILE_PREFIX}.${ApplicationParameters.packageName}.`
    ) +
      '([^\\W_]+)' +
      HelperText.escapeRegExp(`.${Definition.APPLICATION_FLAG_FILE_SUFFIX}`) +
      '$'
  );

  /**
   * Extrai o id de um  arquivo é um sinalizador de execução.
   */
  public static getIdFromFlagFile(filePath: string): string | undefined {
    const regexMatch = ApplicationParameters.regexFlagFileId.exec(filePath);
    if (regexMatch && regexMatch.length > 1) {
      return regexMatch[1];
    }
    return undefined;
  }
}
