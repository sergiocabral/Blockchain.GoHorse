import {
  CommandLine,
  HelperNodeJs,
  HelperText,
  InvalidDataError,
  IPackageJson
} from '@sergiocabral/helper';
import path from 'path';

/**
 * Informações sobre a linha de comando.
 */
export class Argument extends CommandLine {
  /**
   * Construtor.
   * @param commandLine Argumentos da linha de comando.
   */
  constructor(commandLine: string | string[]) {
    super(Array.isArray(commandLine) ? commandLine.join(' ') : commandLine, {
      caseInsensitiveForName: false,
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
   * Nome do arquivo de configuração.
   */
  public get configurationFileName(): string {
    return `env.${this.applicationName}.json`;
  }

  /**
   * Caminho do arquivo de configuração.
   */
  private configurationFilePathValue?: string;

  /**
   * Caminho do arquivo de configuração.
   */
  public get configurationFilePath(): string {
    if (this.configurationFilePathValue === undefined) {
      const currentDirectory = process.cwd();
      this.configurationFilePathValue = path.join(
        currentDirectory,
        this.configurationFileName
      );
    }
    return this.configurationFilePathValue;
  }
}
