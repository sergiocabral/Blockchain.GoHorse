import { LoggerToStream } from '@gohorse/npm-log';
import { LogWriterToConsole } from '@sergiocabral/helper';
import { LogToConsoleConfiguration } from './LogToConsoleConfiguration';

export class LogToConsole extends LoggerToStream<
  LogWriterToConsole,
  LogToConsoleConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToConsole';

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToConsole.logContext;
  }

  /**
   * Cria a instância do logger.
   */
  protected override createInstance(): LogWriterToConsole {
    return new LogWriterToConsole();
  }

  /**
   * Configura a instância do logger.
   */
  protected override configureInstance(): void {
    // Nada a fazer.
  }
}
