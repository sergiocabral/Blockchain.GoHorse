import { JsonLoader, LogLevel } from '@sergiocabral/helper';

/**
 * Nível de configuração de log.
 */
export class LogConfiguration extends JsonLoader {
  /**
   * Sinaliza que o log está ativo.
   */
  public enabled = true;

  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public minimumLevel = LogLevel[LogLevel.Verbose];

  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public get minimumLevelValue(): LogLevel {
    return LogLevel[
      this.minimumLevel as unknown as number
    ] as unknown as LogLevel;
  }

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    const namesOfLogLevel: string[] = Object.keys(LogLevel).filter(key =>
      isNaN(parseInt(key))
    );

    errors.push(
      ...JsonLoader.mustBeBoolean<LogConfiguration>(this, 'enabled'),
      ...JsonLoader.mustBeInTheSet<LogConfiguration>(
        this,
        'minimumLevel',
        namesOfLogLevel,
        'value and type',
        false
      )
    );

    return errors;
  }
}
