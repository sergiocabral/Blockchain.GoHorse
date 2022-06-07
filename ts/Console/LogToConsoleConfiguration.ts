import { LoggerToStreamConfiguration } from '@gohorse/npm-log';
import { LogLevel } from '@sergiocabral/helper';

/**
 * Configurações do logger.
 */
export class LogToConsoleConfiguration extends LoggerToStreamConfiguration {
  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public override minimumLevel = LogLevel[LogLevel.Verbose];
}
