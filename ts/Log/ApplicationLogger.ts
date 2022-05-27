import {
  ILogMessage,
  ILogWriter,
  InvalidDataError,
  Logger,
  LogLevel,
  LogWriterToConsole
} from '@sergiocabral/helper';
import { LoggerConfiguration } from './LoggerConfiguration';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import { CreateLogToConsole } from './Console/CreateLogToConsole';
import { CreateLogToFile } from './File/CreateLogToFile';

/**
 * Argumentos da função post().
 */
type PostArguments = [
  string | (() => string),
  unknown,
  LogLevel | undefined,
  string | undefined,
  Date | undefined
];

/**
 * Logger da aplicação.
 */
export class ApplicationLogger implements ILogWriter {
  /**
   * Sinaliza que o Logger com seus Writers foram configurados.
   */
  private configured = false;

  /**
   * Sinaliza se o log está ativo ou não para postar.
   */
  public get enabled(): boolean {
    for (const writer of this.writers) {
      if (writer.enabled) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sinaliza se o log está ativo ou não para postar.
   */
  public set enabled(value: boolean) {
    for (const writer of this.writers) {
      writer.enabled = value;
    }
  }

  /**
   * Nível mínimo de log para aceitar escrita do log recebido.
   */
  public get minimumLevel(): LogLevel {
    return Logger.maxLogLevel(
      ...this.writers.map(writer => writer.minimumLevel)
    );
  }

  /**
   * Nível padrão de log quando não informado.
   */
  public get defaultLogLevel(): LogLevel {
    return Logger.maxLogLevel(
      ...this.writers.map(writer => writer.defaultLogLevel)
    );
  }

  /**
   * Valores padrão associados a cada log.
   */
  public readonly defaultValues: Record<string, unknown | (() => unknown)> = {};

  /**
   * Lista de escritores de logs.
   */
  private readonly writers: ILogWriter[] = [];

  /**
   * Buffer de mensagem antes da inicialização.
   */
  private buffer: PostArguments[] = [];

  /**
   * Configura o log com base no JSON e parâmetros da aplicação.
   * @param configuration JSON de configuração.
   * @param applicationParameters Parâmetros da aplicação.
   */
  public configure(
    configuration: LoggerConfiguration,
    applicationParameters: ApplicationParameters
  ): void {
    const createLogParameters = { logWriterBase: this, applicationParameters };
    this.writers.push(
      ...[
        new CreateLogToConsole().create({
          configuration: configuration.toConsole,
          ...createLogParameters
        }),
        new CreateLogToFile().create({
          configuration: configuration.toFile,
          ...createLogParameters
        })
      ]
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
   * @param timestamp Proibido informar. Data e hora da mensagem.
   */
  public post(
    messageTemplate: string | (() => string),
    values?: unknown | (() => unknown),
    level?: LogLevel,
    section?: string,
    timestamp?: Date
  ): void {
    if (timestamp !== undefined) {
      throw new InvalidDataError(
        "The argument 'timestamp' must not be informed."
      );
    }
    this.persistOrBufferizer(
      [messageTemplate, values, level, section, new Date()],
      'use-buffer'
    );
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

  /**
   * Despeja no console qualquer log presente no buffer.
   */
  public flushToConsole(): void {
    const logWriterToConsole =
      this.writers.find(logWriter => logWriter instanceof LogWriterToConsole) ??
      new LogWriterToConsole();
    this.flush(postArguments =>
      logWriterToConsole.post(
        postArguments[0],
        postArguments[1],
        postArguments[2],
        postArguments[3],
        postArguments[4]
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
      for (const logWriters of this.writers) {
        logWriters.post(
          postArguments[0],
          postArguments[1],
          postArguments[2],
          postArguments[3],
          postArguments[4]
        );
      }
    } else {
      this.buffer.push(postArguments);
    }
  }
}
