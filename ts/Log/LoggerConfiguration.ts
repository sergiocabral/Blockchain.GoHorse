import { JsonLoader } from '@sergiocabral/helper';
import { LogToFileConfiguration } from './File/LogToFileConfiguration';
import { LogToConsoleConfiguration } from './Console/LogToConsoleConfiguration';

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
