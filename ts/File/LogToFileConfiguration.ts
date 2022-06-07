import { JsonLoader, LogLevel } from '@sergiocabral/helper';
import { LoggerToStreamConfiguration } from '@gohorse/npm-log';
import { GlobalDefinition, TemplateString } from '@gohorse/npm-core';

/**
 * Configurações do logger.
 */
export class LogToFileConfiguration extends LoggerToStreamConfiguration {
  /**
   * Nível mínimo aceito para postar a mensagem do log.
   */
  public override minimumLevel = LogLevel[LogLevel.Verbose];

  /**
   * Template para o nome do arquivo gravado.
   */
  public fileTemplate = `${GlobalDefinition.ENVIRONMENT_FILE_PREFIX}.${TemplateString.VARIABLE.APPLICATION_NAME}.${TemplateString.VARIABLE.DATETIME}.${TemplateString.VARIABLE.INSTANCE_ID}.log`;

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
