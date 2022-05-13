import { JsonLoader } from '@sergiocabral/helper';
import { LogConfiguration } from './LogConfiguration';
import { LogToFileConfiguration } from './LogToFileConfiguration';

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
  public toFile = new LogToFileConfiguration().setName('toFile', this);
}
