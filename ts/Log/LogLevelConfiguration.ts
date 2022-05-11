import { JsonLoader, LogLevel } from '@sergiocabral/helper';

/**
 * Nível de configuração de log.
 */
export class LogLevelConfiguration extends JsonLoader {
  /**
   * Sinaliza que o log está ativo.
   */
  public enabled = true;

  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public minimumLevel = LogLevel[LogLevel.Verbose]; // TODO: Gravar LogLevel como texto.

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    const namesOfLogLevel: string[] = Object.keys(LogLevel).filter(key =>
      isNaN(parseInt(key))
    );

    errors.push(
      ...JsonLoader.mustBeBoolean<LogLevelConfiguration>(this, 'enabled'),
      ...JsonLoader.mustBeInTheSet<LogLevelConfiguration>(
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
