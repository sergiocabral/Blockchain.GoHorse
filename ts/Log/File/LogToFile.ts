import { Logger, LogLevel } from '@sergiocabral/helper';
import { ApplicationLoggerToStream } from '../ApplicationLoggerToStream';
import { LogToFileConfiguration } from './LogToFileConfiguration';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import path from 'path';
import { ApplicationParameters } from '../../Core/ApplicationParameters';

export class LogToFile extends ApplicationLoggerToStream<
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
   * @param applicationParameters Parâmetros da aplicação.
   */
  protected override configureInstance(
    configuration: LogToFileConfiguration,
    applicationParameters: ApplicationParameters
  ): void {
    this.instance.file = path.join(
      process.cwd(),
      configuration.fileTemplate.querystring({
        appName: applicationParameters.applicationName,
        timestamp: applicationParameters.startupTime.format({
          mask: 'y-M-d-h-m-s'
        }),
        appId: applicationParameters.applicationId
      })
    );

    Logger.post(
      'Setting logger "{logWriterType}" to send data to file: {filePath}.',
      {
        logWriterType: this.type,
        filePath: this.instance.file
      },
      LogLevel.Debug,
      LogToFile.logContext
    );
  }
}
