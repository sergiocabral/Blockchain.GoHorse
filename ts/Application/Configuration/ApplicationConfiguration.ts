import { TranslateConfiguration } from '@gohorse/npm-i18n';
import { IOError, JsonLoader, Logger, LogLevel } from '@sergiocabral/helper';
import fs from 'fs';
import { ApplicationLoggerCollectionConfiguration } from './ApplicationLoggerCollectionConfiguration';
import { ApplicationDatabaseConfiguration } from './ApplicationDatabaseConfiguration';
import { ApplicationEncryptConfiguration } from './ApplicationEncryptConfiguration';
import { Json } from '../../Helper/Json';

/**
 * Configurações da aplicação.
 */
export class ApplicationConfiguration extends JsonLoader {
  /**
   * Contexto de log.
   */
  private static logContext = 'ApplicationConfiguration';

  /**
   * Habilita a criptografia dos dados sensíveis no JSON.
   */
  public encryptThisJson = new ApplicationEncryptConfiguration().setName(
    'encryptThisJson',
    this
  );

  /**
   * Configurações de idioma.
   */
  public language = new TranslateConfiguration().setName('language', this);

  /**
   * Configurações de log.
   */
  public logger = new ApplicationLoggerCollectionConfiguration().setName(
    'logger',
    this
  );

  /**
   * Configurações de banco de dados.
   */
  public database = new ApplicationDatabaseConfiguration().setName(
    'database',
    this
  );

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
        JSON.stringify(
          ApplicationEncryptConfiguration.encrypt(
            configuration as unknown as Json,
            configuration.encryptThisJson.password,
            keyPath =>
              ApplicationConfiguration.needToEncrypt(
                keyPath,
                configuration.encryptThisJson
              )
          ),
          undefined,
          '  '
        )
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
      fileContentAsJson = JSON.parse(fileContent) as Record<string, unknown>;
      fileContentAsJson = ApplicationEncryptConfiguration.decrypt(
        fileContentAsJson as Json,
        (fileContentAsJson as Partial<ApplicationConfiguration> | undefined)
          ?.encryptThisJson?.password,
        keyPath => ApplicationConfiguration.needToDecrypt(keyPath)
      );
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
        JSON.stringify(
          ApplicationEncryptConfiguration.encrypt(
            configuration as unknown as Json,
            configuration.encryptThisJson.password,
            keyPath =>
              ApplicationConfiguration.needToEncrypt(
                keyPath,
                configuration.encryptThisJson
              )
          ),
          undefined,
          '  '
        )
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

  /**
   * Verifica se uma chave do JSON deve ser criptografada.
   * @param keyPath Caminho do JSON.
   * @param encryptConfiguration Informações sobre a criptografia dos dados sensíveis no JSON.
   */
  private static needToEncrypt(
    keyPath: string,
    encryptConfiguration: ApplicationEncryptConfiguration
  ): boolean {
    return (
      encryptConfiguration.enabled &&
      !keyPath.startsWith('encryptThisJson.') &&
      (encryptConfiguration.allFields ||
        ApplicationEncryptConfiguration.regexSensitiveFields.test(keyPath))
    );
  }

  /**
   * Verifica se uma chave do JSON deve ser descriptografada
   * @param keyPath Caminho do JSON
   */
  private static needToDecrypt(keyPath: string): boolean {
    return !keyPath.startsWith('encryptThisJson.');
  }
}
