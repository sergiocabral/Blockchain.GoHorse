import {
  HelperText,
  JsonLoader,
  PrimitiveValueType
} from '@sergiocabral/helper';
import { Generate } from '@gohorse/npm-core';
import { HelperCryptography2 } from '../../Helper/HelperCryptography2';
import { Json } from '../../Helper/Json';

/**
 * Informações sobre a criptografia dos dados sensíveis no JSON.
 */
export class ApplicationEncryptConfiguration extends JsonLoader {
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
    password: string | undefined | null,
    needToApplyEncryption: (
      keyPath: string,
      keyValue: PrimitiveValueType | null
    ) => boolean
  ): Json {
    return HelperCryptography2.json(
      'encrypt',
      content,
      needToApplyEncryption,
      password ?? ''
    );
  }

  /**
   * Descriptografa um JSON.
   */
  public static decrypt(
    content: Json,
    password: string | undefined | null,
    needToApplyEncryption: (
      keyPath: string,
      keyValue: PrimitiveValueType | null
    ) => boolean
  ): Json {
    return HelperCryptography2.json(
      'decrypt',
      content,
      needToApplyEncryption,
      password ?? ''
    );
  }
}
