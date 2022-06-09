import { HelperText, JsonLoader, Logger, LogLevel } from '@sergiocabral/helper';
import { Generate } from '@gohorse/npm-core';
import { HelperCryptography2 } from '../../Helper/HelperCryptography2';
import { Json } from '../../Helper/Json';
import { CryptographyDirection } from '../../Helper/CryptographyDirection';

/**
 * Informações sobre a criptografia dos dados sensíveis no JSON.
 */
export class ApplicationEncryptConfiguration extends JsonLoader {
  /**
   * Contexto de log.
   */
  private static logContext = 'ApplicationEncryptConfiguration';

  /**
   * Sinaliza que a criptografia está ativa.
   */
  public enabled = true;

  /**
   * Criptografa todos os campos.
   */
  public allFields = false;

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
      ...JsonLoader.mustBeBoolean<ApplicationEncryptConfiguration>(
        this,
        'enabled'
      )
    );
    errors.push(
      ...JsonLoader.mustBeStringOrNotInformed<ApplicationEncryptConfiguration>(
        this,
        'password'
      )
    );
    errors.push(
      ...JsonLoader.mustBeBoolean<ApplicationEncryptConfiguration>(
        this,
        'allFields'
      )
    );
    errors.push(...super.errors());

    return errors;
  }

  /**
   * Lista de campos que contem dados sensíveis.
   */
  public static regexSensitiveFields = new RegExp(
    `(?:^|\\.)(${['server', 'port', 'protocol', 'username', 'password']
      .map(field => HelperText.escapeRegExp(field))
      .join('|')})$`
  );

  /**
   * Criptografa um JSON.
   */
  public static encrypt(
    content: Json,
    configuration: ApplicationEncryptConfiguration
  ): Json {
    Logger.post(
      'Encryption in JSON configuration file enabled: {enabled}. Mode if enabled: {encryptionMode}.',
      {
        enabled: configuration.enabled,
        encryptionMode: configuration.allFields
          ? 'all fields'
          : 'sensitive fields'
      },
      LogLevel.Debug,
      ApplicationEncryptConfiguration.logContext
    );

    return HelperCryptography2.json(
      CryptographyDirection.Encrypt,
      content,
      configuration.password ?? '',
      keyPath =>
        ApplicationEncryptConfiguration.needToEncrypt(keyPath, configuration)
    );
  }

  /**
   * Descriptografa um JSON.
   */
  public static decrypt(
    content: Json,
    configuration?: Partial<ApplicationEncryptConfiguration>
  ): Json {
    return HelperCryptography2.json(
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
    encryptConfiguration: ApplicationEncryptConfiguration
  ): boolean {
    const needToEncrypt =
      encryptConfiguration.enabled &&
      !keyPath.startsWith('encryptThisJson.') &&
      (encryptConfiguration.allFields ||
        ApplicationEncryptConfiguration.regexSensitiveFields.test(keyPath));
    if (needToEncrypt) {
      Logger.post(
        'Keeping JSON key encrypted: {jsonPath}',
        { jsonPath: keyPath },
        LogLevel.Verbose,
        ApplicationEncryptConfiguration.logContext
      );
    }
    return needToEncrypt;
  }
}
