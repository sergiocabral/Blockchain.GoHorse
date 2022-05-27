import { LogConfiguration } from '../LogConfiguration';
import { ILogWriter, LogWriterToConsole } from '@sergiocabral/helper';
import { CreateLog } from '../CreateLog';

export class LogToConsole extends CreateLog<LogConfiguration> {
  /**
   * Cria uma instância de log.
   */
  protected override createInstance(): ILogWriter {
    return new LogWriterToConsole();
  }
}
