import { ApplicationParameters } from '../Core/ApplicationParameters';
import { LogConfiguration } from './LogConfiguration';
import { ILogWriter } from '@sergiocabral/helper';

/**
 * Conjunto de parâmetros para criação de um log writer.
 */
export interface ICreateLogParameters<
  TLogConfiguration extends LogConfiguration
> {
  /**
   * Log writer base.
   */
  logWriterBase: ILogWriter;

  /**
   * Configurações do log writer que será criado.
   */
  getConfiguration: () => TLogConfiguration;

  /**
   * Parâmetros da aplicação.
   */
  getApplicationParameters: () => ApplicationParameters;
}
