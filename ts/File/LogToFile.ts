import { Logger, LogLevel, LogWriterToFile } from '@sergiocabral/helper';
import { LogToFileConfiguration } from './LogToFileConfiguration';
import path from 'path';
import { IInstanceParameters, TemplateString } from '@gohorse/npm-core';
import { LoggerToStream } from '@gohorse/npm-log';

export class LogToFile extends LoggerToStream<
  LogWriterToFile,
  LogToFileConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToFile';

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToFile.logContext;
  }

  /**
   * Cria a instância do logger.
   */
  protected override createInstance(): LogWriterToFile {
    return new LogWriterToFile();
  }

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instância em execução.
   */
  protected override configureInstance(
    configuration: LogToFileConfiguration,
    instanceParameters: IInstanceParameters
  ): void {
    void instanceParameters;

    this.instance.file = path.join(
      process.cwd(),
      TemplateString.replace(configuration.fileTemplate)
    );

    Logger.post(
      'Setting logger "{logWriterType}" to send data to file: {filePath}.',
      () => ({
        logWriterType: this.type,
        filePath: this.instance.file
      }),
      LogLevel.Debug,
      LogToFile.logContext
    );
  }
}
