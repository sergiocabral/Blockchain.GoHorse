import { JsonLoader } from '@sergiocabral/helper';
import { LoggerToStreamConfiguration } from '../LoggerToStreamConfiguration';
import { Definition } from '../../Definition';

/**
 * Configurações do logger.
 */
export class LogToFileConfiguration extends LoggerToStreamConfiguration {
  /**
   * Template para o nome do arquivo gravado.
   */
  public fileTemplate = `${Definition.ENVIRONMENT_FILE_PREFIX}.{appName}.{timestamp}.{appId}.log`;

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
