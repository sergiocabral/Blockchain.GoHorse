import { JsonLoaderFieldErrors } from '@gohorse/npm-core';
import { ApplicationConfiguration } from './ApplicationConfiguration';

/**
 * Configurações comuns a tudo.
 */
export class ApplicationBusClientConfiguration extends ApplicationConfiguration {
  /**
   * Intervalo para realizar PING com o servidor para indicar conexão ativa.
   */
  public pingToServerInSeconds?: number | null;

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoaderFieldErrors.numberEmptyOrBetween(
        this,
        'pingToServerInSeconds',
        [1, Number.MAX_SAFE_INTEGER],
        'integer'
      )
    );
    errors.push(...super.errors());

    return errors;
  }
}
