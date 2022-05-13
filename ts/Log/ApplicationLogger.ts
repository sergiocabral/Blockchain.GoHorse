import {
  EmptyError,
  ILogWriter,
  Logger,
  LogLevel,
  ILogMessage,
  LogWriterToConsole,
  NotEmptyError
} from '@sergiocabral/helper';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import { IApplication } from '../Core/IApplication';
import { Definition } from '../Definition';
import { Application } from '../Core/Application';
import { LogConfiguration } from './LogConfiguration';

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
   * Construtor.
   */
  public constructor() {
    this.toConsole = new LogWriterToConsole();
    this.toFile = new LogWriterToFile();

    this.toFile.defaultValues = this.toConsole.defaultValues;

    this.toConsole.customFactoryMessage = this.toFile.customFactoryMessage =
      this.customFactoryMessage.bind(this);
  }

  /**
   * Logger para console.
   */
  private readonly toConsole: LogWriterToConsole;

  /**
   * Logger para arquivos.
   */
  private readonly toFile: LogWriterToFile;

  /**
   * Instância da aplicação.
   */
  private applicationValue?: IApplication;

  /**
   * Instância da aplicação.
   */
  private get application(): IApplication {
    if (this.applicationValue === undefined) {
      throw new EmptyError('Application not defined.');
    }

    return this.applicationValue;
  }

  /**
   * Instância da aplicação.
   */
  private set application(value: IApplication) {
    if (this.applicationValue !== undefined) {
      throw new NotEmptyError('Application already defined.');
    }

    this.applicationValue = value;
  }

  /**
   * Logger pronto para postar além do console.
   */
  private get ready(): boolean {
    return this.applicationValue !== undefined;
  }

  /**
   * Buffer de mensagem antes da inicialização.
   */
  private buffer: PostArguments[] = [];

  /**
   * Inicializa o logger com base na instância da aplicação.
   */
  public configure(application: IApplication): void {
    this.application = application; // TODO: Remover this.application, receber defaultValues de quem chama.

    ApplicationLogger.configureLogWriter(
      this.toFile,
      application.configuration.logger.toFile
    );
    ApplicationLogger.configureLogWriter(
      this.toConsole,
      application.configuration.logger.toConsole
    );

    this.defaultValues['applicationInstanceId'] =
      application.parameters.applicationInstanceIdentifier;
    this.defaultValues['applicationName'] =
      application.parameters.applicationName;
    this.defaultValues['applicationVersion'] =
      application.parameters.applicationVersion;

    const date = this.application.parameters.startupTime.format({
      mask: 'y-M-d-h-m-s'
    });
    this.toFile.file = `${Definition.ENVIRONMENT_FILE_PREFIX}.${this.application.parameters.applicationName}.${date}.${this.application.parameters.applicationInstanceIdentifier}.log`;

    let postArgument: PostArguments | undefined;
    while ((postArgument = this.buffer.shift()) !== undefined) {
      this.persist(postArgument, 'force');
    }
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
    this.toConsole.post(messageTemplate, values, level, section);
    this.persist([messageTemplate, values, level, section]);
  }

  /**
   * Posta uma mensagem de log nos loggers além do console.
   * @param postArguments Argumentos.
   * @param mode Modo de postagem
   */
  private persist(
    postArguments: PostArguments,
    mode: 'force' | 'buffer' = 'buffer'
  ): void {
    if (mode === 'force' || (this.ready && this.buffer.length === 0)) {
      this.toFile.post(
        postArguments[0],
        postArguments[1],
        postArguments[2],
        postArguments[3]
      );
    } else {
      this.buffer.push(postArguments);
    }
  }

  /**
   * Valores padrão associados a cada log.
   */
  public get defaultValues(): Record<string, unknown | (() => unknown)> {
    return this.toConsole.defaultValues;
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
   * Configura uma instância de log.
   */
  private static configureLogWriter(
    logWriter: ILogWriter,
    configuration: LogConfiguration
  ) {
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
  }
}
