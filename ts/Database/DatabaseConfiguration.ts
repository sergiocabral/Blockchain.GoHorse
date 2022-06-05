import { JsonLoader } from '@sergiocabral/helper';

/**
 * Configuração para conexão com o banco de dados.
 */
export abstract class DatabaseConfiguration extends JsonLoader {
  /**
   * ~Sinaliza que a conexão será ativada para uso.
   */
  public enabled = true;

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoader.mustBeBoolean<DatabaseConfiguration>(this, 'enabled')
    );

    errors.push(...super.errors());

    return errors;
  }
}
