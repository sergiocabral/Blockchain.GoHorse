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
   * @param type Construtor da instância de configuração.
   * @param filePath Arquivo de configuração.
   */
  static createNewFile<TConfiguration extends ApplicationConfiguration>(
    type: { new (json?: unknown): TConfiguration },
    filePath: string
  ): TConfiguration {
    Logger.post(
      'Creating the default "{type}" configuration to file: {filePath}',
      {
        type: type.name,
        filePath
      },
      LogLevel.Debug,
      ApplicationConfiguration.logContext
    );

    let configuration: TConfiguration;
    try {
      configuration = new type();
      fs.writeFileSync(
        filePath,
        JSON.stringify(configuration, undefined, '  ')
      );
    } catch (error: unknown) {
      throw new IOError(
        'Cannot create default the "{type}" configuration into file: {filePath}'.querystring(
          {
            configurationType: type.name,
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
   * @param type Construtor da instância de configuração.
   * @param filePath Arquivo de configuração.
   */
  public static loadAndUpdateFile<
    TConfiguration extends ApplicationConfiguration
  >(
    type: { new (json?: unknown): TConfiguration },
    filePath: string
  ): TConfiguration {
    Logger.post(
      'Loading the "{type}" configuration from file: {filePath}',
      {
        type: type.name,
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
        'Cannot read the "{type}" configuration from file: {filePath}'.querystring(
          {
            type: type.name,
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
        'Cannot parse the "{type}" configuration from file: {filePath}'.querystring(
          {
            type: type.name,
            filePath
          }
        ),
        error
      );
    }

    const configuration = new type(fileContentAsJson).initialize();

    try {
      Logger.post(
        'Rewriting back the "{type}" configuration to file: {filePath}',
        {
          type: type.name,
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
        'Cannot update the "{type}" configuration to file: {filePath}'.querystring(
          {
            type: type.name,
            filePath
          }
        ),
        error
      );
    }

    return configuration;
  }
}
