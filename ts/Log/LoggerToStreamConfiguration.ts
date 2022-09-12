import { HelperList, JsonLoader, LogLevel } from '@sergiocabral/helper';

/**
 * Configurações do logger.
 */
export abstract class LoggerToStreamConfiguration extends JsonLoader {
  /**
   * Sinaliza que o log está ativo.
   */
  public enabled = true;

  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public minimumLevel = LogLevel[LogLevel.Information];

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

    errors.push(
      ...JsonLoader.mustBeBoolean<LoggerToStreamConfiguration>(this, 'enabled'),
      ...JsonLoader.mustBeInTheSet<LoggerToStreamConfiguration>(
        this,
        'minimumLevel',
        HelperList.enumValues(LogLevel),
        'value and type',
        false
      )
    );

    return errors;
  }
}
