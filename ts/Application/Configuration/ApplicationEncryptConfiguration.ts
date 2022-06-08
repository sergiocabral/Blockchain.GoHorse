import { JsonLoader } from '@sergiocabral/helper';
import { Generate } from '@gohorse/npm-core';

/**
 * Habilita a criptografia dos dados sensíveis no JSON.
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
}
