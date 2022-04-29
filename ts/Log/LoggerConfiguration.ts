import { JsonLoader } from '@sergiocabral/helper';
import { LogLevelConfiguration } from './LogLevelConfiguration';

/**
 * Configurações do logger da aplicação.
 */
export class LoggerConfiguration extends JsonLoader {
  // TODO: Validar configuração do log.
  // TODO: Enviar JsonLoaderFieldErrors para o helper

  /**
   * Log para console.
   */
  public toConsole = new LogLevelConfiguration();

  /**
   * Log para file.
   */
  public toFile = new LogLevelConfiguration();
}
