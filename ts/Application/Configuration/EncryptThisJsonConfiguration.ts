import {
  CryptographyDirection,
  HelperCryptography,
  Json,
  JsonLoader,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { Generate } from '@gohorse/npm-core';

/**
 * Informações sobre a criptografia dos dados sensíveis no JSON.
 */
export class EncryptThisJsonConfiguration extends JsonLoader {
  /**
   * Contexto de log.
   */
  private static logContext = 'ApplicationEncryptConfiguration';

  /**
   * Nome sugerido para ser usado no arquivo JSON de configuração.
   */
  public static fieldName = 'encryptThisJson';

  /**
   * Sinaliza que a criptografia está ativa.
   */
  public enabled = true;

  /**
   * Criptografa todos os campos.
   */
  public fields: string[] = [
    '\\.server$',
    '\\.port$',
    '\\.protocol$',
    '\\.username$',
    '\\.password$'
  ];

  /**
   * Password usado na criptografia.
   */
  public password?: string | null = Generate.id('', 1024);

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoader.mustBeBoolean<EncryptThisJsonConfiguration>(this, 'enabled')
    );
    errors.push(
      ...JsonLoader.mustBeStringOrNotInformed<EncryptThisJsonConfiguration>(
        this,
        'password'
      )
    );
    errors.push(
      ...JsonLoader.mustBeListOfString<EncryptThisJsonConfiguration>(
        this,
        'fields'
      )
    );
    errors.push(...super.errors());

    return errors;
  }

  /**
   * Criptografa um JSON.
   */
  public static encrypt(
    content: Json,
    configuration: EncryptThisJsonConfiguration
  ): Json {
    Logger.post(
      'Encryption in JSON configuration file enabled: {enabled}. Regular expression patterns if enabled: {fieldRegexList}',
      {
        enabled: configuration.enabled,
        fieldRegexList: configuration.fields
      },
      LogLevel.Debug,
      EncryptThisJsonConfiguration.logContext
    );

    return HelperCryptography.json(
      CryptographyDirection.Encrypt,
      content,
      configuration.password ?? '',
      keyPath =>
        EncryptThisJsonConfiguration.needToEncrypt(keyPath, configuration)
    );
  }

  /**
   * Descriptografa um JSON.
   */
  public static decrypt(
    content: Json,
    configuration?: Partial<EncryptThisJsonConfiguration>
  ): Json {
    return HelperCryptography.json(
      CryptographyDirection.Decrypt,
      content,
      configuration?.password ?? ''
    );
  }

  /**
   * Verifica se uma chave do JSON deve ser criptografada.
   * @param keyPath Caminho do JSON.
   * @param encryptConfiguration Informações sobre a criptografia dos dados sensíveis no JSON.
   */
  public static needToEncrypt(
    keyPath: string,
    encryptConfiguration: EncryptThisJsonConfiguration
  ): boolean {
    const needToEncrypt =
      encryptConfiguration.enabled &&
      !keyPath.startsWith(`${EncryptThisJsonConfiguration.fieldName}.`) &&
      encryptConfiguration.fields.length > 0 &&
      encryptConfiguration.fields.some(regex =>
        new RegExp(regex).test(keyPath)
      );
    if (needToEncrypt) {
      Logger.post(
        'Keeping JSON key encrypted: {jsonPath}',
        { jsonPath: keyPath },
        LogLevel.Verbose,
        EncryptThisJsonConfiguration.logContext
      );
    }
    return needToEncrypt;
  }
}
