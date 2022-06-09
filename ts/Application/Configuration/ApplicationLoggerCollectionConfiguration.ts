import { JsonLoader } from '@sergiocabral/helper';
import { LogToConsoleConfiguration } from '@gohorse/npm-log-console';
import { LogToFileConfiguration } from '@gohorse/npm-log-file';
import { LogToDatabaseConfiguration } from '@gohorse/npm-log-database';

/**
 * Configurações do logger da aplicação.
 */
export class ApplicationLoggerCollectionConfiguration extends JsonLoader {
  /**
   * Log para console.
   */
  public toConsole = new LogToConsoleConfiguration().setName('toConsole', this);

  /**
   * Log para file.
   */
  public toFile = new LogToFileConfiguration().setName('toFile', this);

  /**
   * Log para banco de dados.
   */
  public toDatabase = new LogToDatabaseConfiguration().setName(
    'toDatabase',
    this
  );
}
