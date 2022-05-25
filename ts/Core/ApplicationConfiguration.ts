import { TranslateConfiguration } from '@gohorse/npm-i18n';
import { IOError, JsonLoader, Logger, LogLevel } from '@sergiocabral/helper';
import fs from 'fs';
import { LoggerConfiguration } from '../Log/LoggerConfiguration';

/**
 * Configurações da aplicação.
 */
export class ApplicationConfiguration extends JsonLoader {
  /**
   * Contexto de log.
   */
  private static logContext = 'ApplicationConfiguration';

  /**
   * Configurações de idioma.
   */
  public language = new TranslateConfiguration().setName('language', this);

  /**
   * Configurações de log.
   */
  public logger = new LoggerConfiguration().setName('logger', this);

  /**
   * Cria um arquivo em disco com as configurações padrão.
   * @param typeConstructor Construtor da instância de configuração.
   * @param filePath Arquivo de configuração.
   */
  static createNewFile<TConfiguration extends ApplicationConfiguration>(
    typeConstructor: { new (json?: unknown): TConfiguration },
    filePath: string
  ): TConfiguration {
    Logger.post(
      'Creating the default "{configurationType}" configuration to file: {filePath}',
      {
        configurationType: typeConstructor.name,
        filePath
      },
      LogLevel.Debug,
      ApplicationConfiguration.logContext
    );

    let configuration: TConfiguration;
    try {
      configuration = new typeConstructor();
      fs.writeFileSync(
        filePath,
        JSON.stringify(configuration, undefined, '  ')
      );
    } catch (error: unknown) {
      throw new IOError(
        'Cannot create default the "{configurationType}" configuration into file: {filePath}'.querystring(
          {
            configurationType: typeConstructor.name,
            filePath
          }
        ),
        error
      );
    }

    return configuration;
  }

  /**
   * Carrega as configurações de um arquivo em disco.
   * @param typeConstructor Construtor da instância de configuração.
   * @param filePath Arquivo de configuração.
   */
  public static loadAndUpdateFile<
    TConfiguration extends ApplicationConfiguration
  >(
    typeConstructor: { new (json?: unknown): TConfiguration },
    filePath: string
  ): TConfiguration {
    Logger.post(
      'Loading the "{configurationType}" configuration from file: {filePath}',
      {
        configurationType: typeConstructor.name,
        filePath
      },
      LogLevel.Debug,
      ApplicationConfiguration.logContext
    );

    let fileContent: string;
    try {
      fileContent = fs.readFileSync(filePath).toString();
    } catch (error: unknown) {
      throw new IOError(
        'Cannot read the "{configurationType}" configuration from file: {filePath}'.querystring(
          {
            configurationType: typeConstructor.name,
            filePath
          }
        ),
        error
      );
    }

    let fileContentAsJson: unknown;
    try {
      fileContentAsJson = JSON.parse(fileContent);
    } catch (error: unknown) {
      throw new IOError(
        'Cannot parse the "{configurationType}" configuration from file: {filePath}'.querystring(
          {
            configurationType: typeConstructor.name,
            filePath
          }
        ),
        error
      );
    }

    const configuration = new typeConstructor(fileContentAsJson).initialize();

    try {
      Logger.post(
        'Rewriting back the "{configurationType}" configuration to file: {filePath}',
        {
          configurationType: typeConstructor.name,
          filePath
        },
        LogLevel.Debug,
        ApplicationConfiguration.logContext
      );

      fs.writeFileSync(
        filePath,
        JSON.stringify(configuration, undefined, '  ')
      );
    } catch (error: unknown) {
      throw new IOError(
        'Cannot update the "{configurationType}" configuration to file: {filePath}'.querystring(
          {
            configurationType: typeConstructor.name,
            filePath
          }
        ),
        error
      );
    }

    return configuration;
  }
}
