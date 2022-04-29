import {
  EmptyError,
  ILogWriter,
  LogWriterToConsole,
  NotEmptyError
} from '@sergiocabral/helper';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import { IApplication } from './IApplication';
import { LogLevel } from '@sergiocabral/helper/js/Log/LogLevel';
import { ILogMessage } from '@sergiocabral/helper/js/Log/ILogMessage';
import { Definition } from '../Definition';
import { ApplicationParameters } from './ApplicationParameters';

/**
 * Logger da aplicação.
 */
export class ApplicationLogger implements ILogWriter {
  /**
   * Construtor.
   */
  public constructor() {
    this.toConsole = new LogWriterToConsole();
    this.toFile = new LogWriterToFile();

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
   * Inicializa o logger com base na instância da aplicação.
   */
  public configure(application: IApplication): void {
    this.application = application;

    const date = this.application.parameters.startupTime.format({
      mask: 'y-M-d-h-m-s'
    });
    this.toFile.file = `${Definition.ENVIRONMENT_FILE_PREFIX}.${this.application.parameters.applicationName}.${this.application.parameters.applicationInstanceIdentifier}.${date}.log`;
  }

  /**
   * Posta uma mensagem de log.
   * @param messageTemplate Mensagem como template.
   * @param values Valores associados.
   * @param level Nível.
   * @param section Seção, ou contexto, relacionado.
   */
  post(
    messageTemplate: string | (() => string),
    values?: unknown | (() => unknown),
    level?: LogLevel,
    section?: string
  ): void {
    this.toConsole.post(messageTemplate, values, level, section);
    if (this.ready) {
      this.toFile.post(messageTemplate, values, level, section);
    } else {
      // TODO: Buffer de logs.
    }
  }

  /**
   * Valores padrão associados a cada log.
   */
  public defaultValues: Record<string, unknown | (() => unknown)> = {};

  /**
   * Função para personalizar a exibição de uma mensagem de log.
   */
  public customFactoryMessage(message: ILogMessage): string {
    return `${
      ApplicationParameters.applicationInstanceIdentifier
    }: ${message.timestamp.format({ mask: 'universal' })} [${
      LogLevel[message.level] + (message.section ? ': ' + message.section : '')
    }] ${message.message}`;
  }
}
