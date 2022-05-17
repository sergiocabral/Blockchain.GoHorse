import { JsonLoader } from '@sergiocabral/helper';
import { LogConfiguration } from './LogConfiguration';
import { Definition } from '../Definition';

/**
 * Nível de configuração de log.
 */
export class LogToFileConfiguration extends LogConfiguration {
  /**
   * Template para o nome do arquivo gravado.
   */
  public fileTemplate = `${Definition.ENVIRONMENT_FILE_PREFIX}.{appName}.{timestamp}.{instanceId}.log`;

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = super.errors();

    errors.push(
      ...JsonLoader.mustBeString<LogToFileConfiguration>(this, 'fileTemplate')
    );

    return errors;
  }
}
