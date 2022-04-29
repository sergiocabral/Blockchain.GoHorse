import {
  EmptyError,
  ILogWriter,
  LogWriterToConsole,
  NotEmptyError
} from '@sergiocabral/helper';
import { LogWriterToFile } from '@sergiocabral/helper/js/Log/LogWriterToFile';
import { IApplication } from '../Core/IApplication';
import { LogLevel } from '@sergiocabral/helper/js/Log/LogLevel';
import { ILogMessage } from '@sergiocabral/helper/js/Log/ILogMessage';
import { Definition } from '../Definition';
import { ApplicationParameters } from '../Core/ApplicationParameters';

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
    this.application = application;

    this.defaultValues['instanceId'] =
      application.parameters.applicationInstanceIdentifier;
    this.defaultValues['application'] = application.parameters.applicationName;

    const date = this.application.parameters.startupTime.format({
      mask: 'y-M-d-h-m-s'
    });
    this.toFile.file = `${Definition.ENVIRONMENT_FILE_PREFIX}.${this.application.parameters.applicationName}.${this.application.parameters.applicationInstanceIdentifier}.${date}.log`;

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
      ApplicationParameters.applicationInstanceIdentifier
    }: ${message.timestamp.format({ mask: 'universal' })} [${
      LogLevel[message.level] + (message.section ? ': ' + message.section : '')
    }] ${message.message}`;
  }
}
