import { ILogWriter, Logger, LogLevel } from '@sergiocabral/helper';
import { CreateLog } from '../CreateLog';
import { LogToFileConfiguration } from './LogToFileConfiguration';
import { ApplicationParameters } from '../../Core/ApplicationParameters';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import path from 'path';

export class CreateLogToFile extends CreateLog<LogToFileConfiguration> {
  /**
   * Contexto do log.
   */
  private static logContext = 'CreateLogToFile';

  /**
   * Cria uma instância de log.
   */
  protected override createInstance(
    configuration: LogToFileConfiguration,
    aplicationParameters: ApplicationParameters
  ): ILogWriter {
    const logWriter = new LogWriterToFile();

    logWriter.file = path.join(
      process.cwd(),
      configuration.fileTemplate.querystring({
        appName: aplicationParameters.applicationName,
        timestamp: aplicationParameters.startupTime.format({
          mask: 'y-M-d-h-m-s'
        }),
        instanceId: aplicationParameters.applicationInstanceIdentifier
      })
    );

    Logger.post(
      '{logInstance} log instance sending data to file: {file}',
      {
        logInstance: logWriter.constructor.name,
        file: logWriter.file
      },
      LogLevel.Debug,
      CreateLogToFile.logContext
    );

    return logWriter;
  }
}
