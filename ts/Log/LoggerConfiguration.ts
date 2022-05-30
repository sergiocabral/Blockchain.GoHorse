import { JsonLoader } from '@sergiocabral/helper';
import { LogToConsoleConfiguration } from '@gohorse/npm-log-console';
import { LogToFileConfiguration } from '@gohorse/npm-log-file';

/**
 * Configurações do logger da aplicação.
 */
export class LoggerConfiguration extends JsonLoader {
  /**
   * Log para console.
   */
  public toConsole = new LogToConsoleConfiguration().setName('toConsole', this);

  /**
   * Log para file.
   */
  public toFile = new LogToFileConfiguration().setName('toFile', this);
}
