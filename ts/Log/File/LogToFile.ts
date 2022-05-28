import { ILogWriter, Logger, LogLevel } from '@sergiocabral/helper';
import { CreateLog } from '../CreateLog';
import { LogToFileConfiguration } from './LogToFileConfiguration';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import path from 'path';
import { ICreateLogParameters } from '../ICreateLogParameters';

export class LogToFile extends CreateLog<LogToFileConfiguration> {
  /**
   * Contexto do log.
   */
  private static logContext = 'CreateLogToFile';

  /**
   * Cria uma instância de log.
   * @param parameters Parâmetros de configuração.
   */
  protected override createInstance(
    parameters: ICreateLogParameters<LogToFileConfiguration>
  ): ILogWriter {
    const configuration = parameters.getConfiguration();
    const applicationParameters = parameters.getApplicationParameters();

    const logWriter = new LogWriterToFile();

    logWriter.file = path.join(
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
      '{logInstance} log instance sending data to file: {file}',
      {
        logInstance: logWriter.constructor.name,
        file: logWriter.file
      },
      LogLevel.Debug,
      LogToFile.logContext
    );

    return logWriter;
  }
}
