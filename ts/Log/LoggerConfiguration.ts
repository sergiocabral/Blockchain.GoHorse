import { JsonLoader } from '@sergiocabral/helper';
import { LogConfiguration } from './LogConfiguration';

/**
 * Configurações do logger da aplicação.
 */
export class LoggerConfiguration extends JsonLoader {
  /**
   * Log para console.
   */
  public toConsole = new LogConfiguration().setName('toConsole', this);

  /**
   * Log para file.
   */
  public toFile = new LogConfiguration().setName('toFile', this);
}
