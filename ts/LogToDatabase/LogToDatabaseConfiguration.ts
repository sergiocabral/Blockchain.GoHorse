import { LoggerToStreamConfiguration } from '@gohorse/npm-log';
import { JsonLoader } from '@sergiocabral/helper';
import { GlobalDefinition } from '@gohorse/npm-core';

/**
 * Configurações do logger.
 */
export class LogToDatabaseConfiguration extends LoggerToStreamConfiguration {
  /**
   * Espera em milissegundos em caso de erro antes da próxima tentativa de envio dos dados.
   */
  public waitInMillisecondsOnError =
    GlobalDefinition.TIME_OF_ONE_MINUTE_IN_MILLISECONDS;

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoader.mustBeNumberGreaterThanOrEqual<LogToDatabaseConfiguration>(
        this,
        'waitInMillisecondsOnError',
        GlobalDefinition.TIME_OF_ONE_SECOND_IN_MILLISECONDS
      )
    );

    errors.push(...super.errors());

    return errors;
  }
}
