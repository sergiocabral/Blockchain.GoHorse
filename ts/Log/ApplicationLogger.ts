import {
  ILogWriter,
  Logger,
  LogLevel,
  ILogMessage,
  LogWriterToConsole
} from '@sergiocabral/helper';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import { Application } from '../Core/Application';
import { LogConfiguration } from './LogConfiguration';
import { LoggerConfiguration } from './LoggerConfiguration';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import { LogToFileConfiguration } from './LogToFileConfiguration';

/**
 * Argumentos da função post().
 */
type PostArguments = [
  string | (() => string),
  unknown,
  LogLevel | undefined,
  string | undefined
];

/**
 * Logger da aplicação.
 */
export class ApplicationLogger implements ILogWriter {
  /**
   * Contexto do log.
   */
  private static logContext = 'ApplicationLogger';

  /**
   * Sinaliza que o Logger com seus Writers foram configurados.
   */
  private configured = false;

  /**
   * Valores padrão associados a cada log.
   */
  public readonly defaultValues: Record<string, unknown | (() => unknown)> = {};

  /**
   * Lista de escritores de logs.
   */
  private readonly logWriters: ILogWriter[] = [];

  /**
   * Buffer de mensagem antes da inicialização.
   */
  private buffer: PostArguments[] = [];

  /**
   * Configura o log com base no JSON e parâmetros da aplicação.
   * @param configuration JSON de configuração.
   * @param aplicationParameters Parâmetros da aplicação.
   */
  public configure(
    configuration: LoggerConfiguration,
    aplicationParameters: ApplicationParameters
  ): void {
    this.logWriters.push(
      this.createLogWriterToConsole(configuration.toConsole)
    );
    this.logWriters.push(
      this.createLogWriterToFile(configuration.toFile, aplicationParameters)
    );
    this.configured = true;
    this.flushToPersistence();
  }

  /**
   * Posta uma mensagem de log.
   * @param messageTemplate Mensagem como template.
   * @param values Valores associados.
   * @param level Nível.
   * @param section Seção, ou contexto, relacionado.
   */
  public post(
    messageTemplate: string | (() => string),
    values?: unknown | (() => unknown),
    level?: LogLevel,
    section?: string
  ): void {
    this.persistOrBufferizer(
      [messageTemplate, values, level, section],
      'use-buffer'
    );
  }

  /**
   * Função para personalizar a exibição de uma mensagem de log.
   */
  public customFactoryMessage(message: ILogMessage): string {
    return `${
      Application.applicationInstanceIdentifier
    }: ${message.timestamp.format({ mask: 'universal' })} [${
      LogLevel[message.level] + (message.section ? ': ' + message.section : '')
    }] ${message.message}`;
  }

  /**
   * Despeja no console qualquer log presente no buffer.
   */
  public flushToConsole(): void {
    const logWriterToConsole =
      this.logWriters.find(
        logWriter => logWriter instanceof LogWriterToConsole
      ) ?? new LogWriterToConsole();
    this.flush(postArguments =>
      logWriterToConsole.post(
        postArguments[0],
        postArguments[1],
        postArguments[2],
        postArguments[3]
      )
    );
  }

  /**
   * Liberar as mensagens dop buffer para os LogWriters.
   */
  private flushToPersistence(): void {
    this.flush(postArguments =>
      this.persistOrBufferizer(postArguments, 'no-buffer')
    );
  }

  /**
   * Liberar as mensagens dop buffer para os LogWriters.
   */
  private flush(post: (postArguments: PostArguments) => void): void {
    let postArguments: PostArguments | undefined;
    while ((postArguments = this.buffer.shift()) !== undefined) {
      post(postArguments);
    }
  }

  /**
   * Posta uma mensagem de log no buffer ou nos log writers.
   * @param postArguments Argumentos do log.
   * @param mode Use 'use-buffer' para postagem normal e 'no-buffer' para força escrita imediata.
   */
  private persistOrBufferizer(
    postArguments: PostArguments,
    mode: 'use-buffer' | 'no-buffer'
  ): void {
    if (mode === 'no-buffer' || (this.configured && this.buffer.length === 0)) {
      for (const logWriters of this.logWriters) {
        logWriters.post(
          postArguments[0],
          postArguments[1],
          postArguments[2],
          postArguments[3]
        );
      }
    } else {
      this.buffer.push(postArguments);
    }
  }

  /**
   * Contrói o log para console.
   */
  private createLogWriterToConsole(
    configuration: LogConfiguration
  ): ILogWriter {
    const logWriter = new LogWriterToConsole();
    return this.configureLogWriter(logWriter, configuration);
  }

  /**
   * Contrói o log para persistir em arquivo.
   */
  private createLogWriterToFile(
    configuration: LogToFileConfiguration,
    aplicationParameters: ApplicationParameters
  ): ILogWriter {
    const logWriter = new LogWriterToFile();

    logWriter.file = configuration.fileTemplate.querystring({
      appName: aplicationParameters.applicationName,
      timestamp: aplicationParameters.startupTime.format({
        mask: 'y-M-d-h-m-s'
      }),
      appId: aplicationParameters.applicationInstanceIdentifier
    });

    return this.configureLogWriter(logWriter, configuration);
  }

  /**
   * Configura uma instância de log.
   */
  private configureLogWriter(
    logWriter: ILogWriter,
    configuration: LogConfiguration
  ): ILogWriter {
    logWriter.defaultValues = this.defaultValues;
    logWriter.customFactoryMessage = this.customFactoryMessage.bind(this);

    Logger.post(
      'Setting minimum logging level for {logStream} to {logLevel}.',
      {
        logStream: logWriter.constructor.name,
        logLevel: configuration.minimumLevel
      },
      LogLevel.Debug,
      ApplicationLogger.logContext
    );
    logWriter.minimumLevel = configuration.minimumLevelValue;

    //TODO: Implementar ILogWriter.enabled
    //TODO: Revalidar a interface ILogWriter

    return logWriter;
  }
}
