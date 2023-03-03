import { ApplicationExecutionMode } from './Type/ApplicationExecutionMode';
import {
  EmptyError,
  FileSystemMonitoring,
  HelperCryptography,
  HelperNumeric,
  HelperText,
  IFileSystemMonitoringEventData,
  IMessage,
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { ApplicationParameters } from './ApplicationParameters';
import fs from 'fs';
import * as os from 'os';
import { Definition } from '../Definition';
import {
  ApplicationMessage,
  IApplicationMessage,
  Instance,
  ReloadConfiguration,
  TerminateApplication
} from '@gohorse/npm-core';

/**
 * Tipo para o construtor de Message
 */
type ApplicationMessageConstructor = new (
  fromApplicationId: string,
  toApplicationId: string
) => ApplicationMessage;

/**
 * Roteamento de mensagens entre aplicações.
 */
export class ApplicationFlagFileMessageRouter {
  /**
   * Contexto do log.
   */
  private static logContext = 'ApplicationMessageRouter';

  /**
   * Menagens conhecidas
   */
  private static wellKnowMessages: Array<
    [ApplicationExecutionMode, ApplicationMessageConstructor]
  > = [
    [ApplicationExecutionMode.TerminateApplication, TerminateApplication],
    [ApplicationExecutionMode.ReloadConfiguration, ReloadConfiguration]
  ];

  /**
   * Construtor.
   * @param fileMessageMonitoring Monitoramento do arquivo de mensagens.
   */
  public constructor(private fileMessageMonitoring: FileSystemMonitoring) {
    fileMessageMonitoring.onDeleted.add(
      this.onDeletedApplicationFlagFile.bind(this)
    );
    fileMessageMonitoring.onModified.add(
      this.onModifiedApplicationFlagFile.bind(this)
    );
  }

  /**
   * Histórico das última mensagens lidas com o par Identifier=Date
   */
  private messageHistory: Record<string, number> = {};

  /**
   * Data mais recente presente no histórico.
   */
  private getMessageHistoryLastUnixDate(): number {
    const lastReadDates = Object.values(this.messageHistory);
    const lastUnixDate =
      lastReadDates.length === 0
        ? Number.MIN_SAFE_INTEGER
        : HelperNumeric.max(...lastReadDates);
    return HelperNumeric.min(
      lastUnixDate,
      new Date()
        .addSeconds(-Definition.DELAY_TOLERANCE_FOR_READING_MESSAGES_IN_SECONDS)
        .getTime()
    );
  }

  /**
   * Evento: Ao excluir o arquivo de sinalização de execução.
   * @param success Sucesso da operação.
   * @param data Dados associados ao evento.
   */
  private async onDeletedApplicationFlagFile(
    success: boolean,
    data?: IFileSystemMonitoringEventData
  ): Promise<void> {
    if (!success || data === undefined) {
      throw new InvalidExecutionError('Expected onDeleted with success.');
    }
    Logger.post(
      'The message file was deleted: {filePath}',
      () => ({
        filePath: data.before.realpath
      }),
      LogLevel.Debug,
      ApplicationFlagFileMessageRouter.logContext
    );
    await new TerminateApplication(Instance.id, Instance.id).sendAsync();
  }

  /**
   * Evento: Ao modificar o arquivo de sinalização de execução.
   * @param success Sucesso da operação.
   * @param data Dados associados ao evento.
   */
  private async onModifiedApplicationFlagFile(
    success: boolean,
    data?: IFileSystemMonitoringEventData
  ): Promise<void> {
    if (!success || data === undefined || data.after.realpath === undefined) {
      throw new InvalidExecutionError('Expected onModified with success.');
    }
    Logger.post(
      'The message file was modified: {filePath}',
      () => ({
        filePath: data.after.realpath
      }),
      LogLevel.Verbose,
      ApplicationFlagFileMessageRouter.logContext
    );

    const messages = this.readMessagesFromFile(data.after.realpath);
    for (const message of messages) {
      Logger.post(
        'Message "{applicationMessageType}" (id: "{applicationMessageId}") received from the application id "{fromInstanceId}". Submitting for processing in this instance.',
        () => ({
          fromInstanceId: message.fromInstanceId,
          applicationMessageId: message.id,
          applicationMessageType: message.type
        }),
        LogLevel.Debug,
        ApplicationFlagFileMessageRouter.logContext
      );
      await message.sendAsync();
    }
  }

  /**
   * Faz a leitura das mensagens do arquivo.
   */
  private readMessagesFromFile(
    file: string
  ): Array<IMessage & IApplicationMessage> {
    const result = Array<IMessage & IApplicationMessage>();
    const lastReadUnixDate = this.getMessageHistoryLastUnixDate();
    const regexEndOfLine = /[\n\r]/;
    const fileContent = fs.readFileSync(file).toString();
    const lines = fileContent.split(regexEndOfLine);

    for (const line of lines) {
      const message = this.readMessageFromFileLine(line, lastReadUnixDate);
      if (message !== undefined) {
        result.push(message);
      }
    }

    return result;
  }

  /**
   * Regex para extrair data e mensagem de uma linha do arquivo.
   */
  private static regexLineWithMessage =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) (\{.*})$/;

  /**
   * Faz a leitura da mensagem em uma linha do arquivo.
   * @param fileLine Linha do arquivo.
   * @param minUnixDate Data de corte.
   */
  private readMessageFromFileLine(
    fileLine: string,
    minUnixDate: number
  ): (IMessage & IApplicationMessage) | undefined {
    const hash = HelperCryptography.hash(fileLine, 'sha256');
    let alreadyProcessed = this.messageHistory[hash] !== undefined;
    if (alreadyProcessed) {
      return undefined;
    }
    this.messageHistory[hash] = Number.MIN_SAFE_INTEGER;

    const match = fileLine.match(
      ApplicationFlagFileMessageRouter.regexLineWithMessage
    );
    if (match === null) {
      return undefined;
    }

    const unixDate = new Date(match[1]).getTime();
    if (isNaN(unixDate)) {
      Logger.post(
        'Error reading message. Invalid date "{invalidValue}" in file line: {fileLineContent}',
        {
          invalidValue: match[1],
          fileLineContent: fileLine
        },
        LogLevel.Warning,
        ApplicationFlagFileMessageRouter.logContext
      );

      return undefined;
    }

    this.messageHistory[hash] = unixDate;

    if (unixDate < minUnixDate) {
      return undefined;
    }

    const messageAsText = match[2];
    const message = ApplicationFlagFileMessageRouter.parse(messageAsText);
    if (message === undefined) {
      return undefined;
    }

    alreadyProcessed = this.messageHistory[message.id] !== undefined;
    if (alreadyProcessed) {
      Logger.post(
        'Error reading message. Message id "{applicationMessageId}" has already been processed previously: {fileLineContent}',
        () => ({
          applicationMessageId: message.id,
          fileLineContent: fileLine
        }),
        LogLevel.Warning,
        ApplicationFlagFileMessageRouter.logContext
      );

      return undefined;
    }
    this.messageHistory[message.id] = unixDate;

    if (message.toInstanceId !== Instance.id) {
      Logger.post(
        'Error reading message. Message addressed to another application of id "{toInstanceId}": {fileLineContent}',
        () => ({
          toInstanceId: message.toInstanceId,
          fileLineContent: fileLine
        }),
        LogLevel.Warning,
        ApplicationFlagFileMessageRouter.logContext
      );

      return undefined;
    }

    return message;
  }

  /**
   * Valida um conteúdo e entrega a instância de uma mensagem.
   */
  public static parse(
    jsonContent: string
  ): (IMessage & IApplicationMessage) | undefined {
    try {
      const json = JSON.parse(jsonContent) as Partial<IApplicationMessage>;

      if (
        Object.keys(json).includes('name') ||
        json.id === undefined ||
        json.type === undefined ||
        json.fromInstanceId === undefined ||
        json.toInstanceId === undefined
      ) {
        Logger.post(
          'Error reading message. Invalid fields in JSON: {jsonContent}',
          {
            jsonContent
          },
          LogLevel.Warning,
          ApplicationFlagFileMessageRouter.logContext
        );

        return undefined;
      }

      const messageConstructor =
        ApplicationFlagFileMessageRouter.wellKnowMessages.find(
          data => data[1].name === json.type
        );
      if (messageConstructor === undefined) {
        Logger.post(
          'Error reading message. Invalid type "{applicationMessageType}" in message: {jsonContent}',
          () => ({
            applicationMessageType: json.type,
            jsonContent
          }),
          LogLevel.Warning,
          ApplicationFlagFileMessageRouter.logContext
        );

        return undefined;
      }

      return Object.assign(
        new messageConstructor[1](json.fromInstanceId, json.toInstanceId),
        json
      );
    } catch (error) {
      Logger.post(
        'Error reading message. Error "{errorDescription}" when parsing JSON: {jsonContent}',
        () => ({
          errorDescription: HelperText.formatError(error),
          error,
          jsonContent
        }),
        LogLevel.Warning,
        ApplicationFlagFileMessageRouter.logContext
      );

      return undefined;
    }
  }

  /**
   * Retorna a mensagem correspondente ao modo de execução.
   */
  public static factory(
    executionMode: ApplicationExecutionMode,
    fromInstanceId: string,
    toInstanceId: string
  ): IApplicationMessage {
    const wellKnowMessage =
      ApplicationFlagFileMessageRouter.wellKnowMessages.find(
        item => item[0] === executionMode
      );

    if (wellKnowMessage === undefined) {
      throw new InvalidArgumentError('Invalid executionMode');
    }

    const messageConstructor = wellKnowMessage[1];

    return new messageConstructor(fromInstanceId, toInstanceId);
  }

  /**
   * Envia uma mensagem.
   */
  public static async send(message: IApplicationMessage): Promise<void> {
    return new Promise<void>(resolve => {
      const messageClone = JSON.parse(JSON.stringify(message)) as Record<
        string,
        unknown
      >;
      delete messageClone['name'];
      const fileContent =
        `${new Date().toISOString()} ${JSON.stringify(messageClone)}` + os.EOL;
      const instanceFile = ApplicationParameters.getFlagFile(
        message.toInstanceId
      );

      Logger.post(
        'Send message "{applicationMessageType}" to instance "{toInstanceId}".',
        () => ({
          applicationMessageType: message.type,
          toInstanceId: message.toInstanceId
        }),
        LogLevel.Information,
        ApplicationFlagFileMessageRouter.logContext
      );

      Logger.post(
        'Appending message "{applicationMessageType}" into file: {filePath}.',
        () => ({
          applicationMessageType: message.type,
          toInstanceId: message.toInstanceId,
          filePath: instanceFile
        }),
        LogLevel.Debug,
        ApplicationFlagFileMessageRouter.logContext
      );

      fs.appendFileSync(instanceFile, fileContent);
      resolve();
    });
  }

  /**
   * Monta a mensagem correspondente ao modo de execução e envia
   * @param executionMode Modo de execução.
   * @param fromInstanceId
   * @param toInstanceIds
   */
  public static async factoryAndSend(
    executionMode: ApplicationExecutionMode,
    fromInstanceId: string,
    toInstanceIds: string[]
  ): Promise<number> {
    if (toInstanceIds.length === 0) {
      throw new EmptyError('Expected one or more items in toInstanceIds');
    }

    let affectedCount = 0;
    for (const toInstanceId of toInstanceIds) {
      let toInstanceFile = ApplicationParameters.getFlagFile(toInstanceId);
      if (fs.existsSync(toInstanceFile)) {
        toInstanceFile = fs.realpathSync(toInstanceFile);
        affectedCount++;

        const message = ApplicationFlagFileMessageRouter.factory(
          executionMode,
          fromInstanceId,
          toInstanceId
        );

        await ApplicationFlagFileMessageRouter.send(message);
      } else {
        Logger.post(
          'Instance "{toInstanceId}" is not running to receive messages.',
          {
            toInstanceId
          },
          LogLevel.Warning,
          ApplicationFlagFileMessageRouter.logContext
        );
      }
    }

    return affectedCount;
  }
}