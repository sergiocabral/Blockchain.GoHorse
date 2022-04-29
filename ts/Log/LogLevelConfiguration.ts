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
  public minimumLevel = LogLevel.Verbose; // TODO: Gravar LogLevel como texto.
}
