import { ApplicationExecutionMode } from '../Core/ApplicationExecutionMode';
import {
  EmptyError,
  FileSystemMonitoring,
  HelperNumeric,
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
  sha256
} from '@sergiocabral/helper';
import { MessageToInstance } from './MessageToInstance';
import { KillApplication } from './KillApplication';
import { ReloadConfiguration } from './ReloadConfiguration';
import { IMessageToInstance } from './IMessageToInstance';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import fs from 'fs';
import { IFileSystemMonitoringEventData } from '@sergiocabral/helper/js/IO/FileSystem/IFileSystemMonitoringEventData';
import * as os from 'os';
import { Definition } from '../Definition';

/**
 * Tipo para o construtor de Message
 */
type MessageToInstanceConstructor = new (
  fromInstanceId: string,
  toInstanceId: string
) => MessageToInstance;

/**
 * Roteamento de mensagens entre instâncias.
 */
export class MessageRouter {
  /**
   * Contexto do log.
   */
  private static logContext = 'MessageRouter';

  /**
   * Menagens conhecidas
   */
  private static wellKnowMessages: Array<
    [ApplicationExecutionMode, MessageToInstanceConstructor]
  > = [
    [ApplicationExecutionMode.KillApplication, KillApplication],
    [ApplicationExecutionMode.ReloadConfiguration, ReloadConfiguration]
  ];

  /**
   * Construtor.
   * @param fileMessageMonitoring Monitoramento do arquivo de mensagens.
   */
  public constructor(private fileMessageMonitoring: FileSystemMonitoring) {
    fileMessageMonitoring.onDeleted.add(
      this.onDeletedRunningFlagFile.bind(this)
    );
    fileMessageMonitoring.onModified.add(
      this.onModifiedRunningFlagFile.bind(this)
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
        .addSeconds(-Definition.DELAY_TOLERANCE_IN_SECONDS_FOR_READING_MESSAGES)
        .getTime()
    );
  }

  /**
   * Evento ao excluir o arquivo de sinalização de execução.
   */
  private async onDeletedRunningFlagFile(
    success: boolean,
    data?: IFileSystemMonitoringEventData
  ): Promise<void> {
    if (!success || data === undefined) {
      throw new InvalidExecutionError('Expected onDeleted with success.');
    }
    Logger.post(
      'The message file was deleted: {path}',
      {
        path: data.before.realpath
      },
      LogLevel.Debug,
      MessageRouter.logContext
    );
    await new KillApplication(
      ApplicationParameters.applicationInstanceIdentifier,
      ApplicationParameters.applicationInstanceIdentifier
    ).sendAsync();
  }

  /**
   * Evento ao modificar o arquivo de sinalização de execução.
   * @param success Sucesso da operação.
   * @param data Dados associados ao evento.
   */
  private async onModifiedRunningFlagFile(
    success: boolean,
    data?: IFileSystemMonitoringEventData
  ): Promise<void> {
    if (!success || data === undefined || data.after.realpath === undefined) {
      throw new InvalidExecutionError('Expected onModified with success.');
    }
    Logger.post(
      'The message file was modified: {path}',
      {
        path: data.after.realpath
      },
      LogLevel.Verbose,
      MessageRouter.logContext
    );

    const messages = this.readMessagesFromFile(data.after.realpath);
    for (const message of messages) {
      Logger.post(
        'Message "{messageType}" (id: "{messageId}") received from the instance id "{instanceId}". Submitting for processing in this instance.',
        {
          messageId: message.identifier,
          messageType: message.type,
          instanceId: message.fromInstanceId
        },
        LogLevel.Debug,
        MessageRouter.logContext
      );
      await message.sendAsync();
    }
  }

  /**
   * Faz a leitura das mensagens do arquivo.
   */
  private readMessagesFromFile(
    file: string
  ): Array<Message & IMessageToInstance> {
    const result = Array<Message & IMessageToInstance>();
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
  ): (Message & IMessageToInstance) | undefined {
    const hash = sha256(fileLine);
    let alreadyProcessed = this.messageHistory[hash] !== undefined;
    if (alreadyProcessed) {
      return undefined;
    }
    this.messageHistory[hash] = Number.MIN_SAFE_INTEGER;

    const match = fileLine.match(MessageRouter.regexLineWithMessage);
    if (match === null) {
      return undefined;
    }

    const unixDate = new Date(match[1]).getTime();
    if (isNaN(unixDate)) {
      Logger.post(
        'Error reading message. Invalid date "{invalidDate}" in file line: {line}',
        {
          invalidDate: match[1],
          line: fileLine
        },
        LogLevel.Warning,
        MessageRouter.logContext
      );

      return undefined;
    }

    this.messageHistory[hash] = unixDate;

    if (unixDate < minUnixDate) {
      return undefined;
    }

    const messageAsText = match[2];
    const message = MessageRouter.parse(messageAsText);
    if (message === undefined) {
      return undefined;
    }

    alreadyProcessed = this.messageHistory[message.identifier] !== undefined;
    if (alreadyProcessed) {
      Logger.post(
        'Error reading message. Message id "{messageId}" has already been processed previously: {line}',
        {
          messageId: message.identifier,
          line: fileLine
        },
        LogLevel.Warning,
        MessageRouter.logContext
      );

      return undefined;
    }
    this.messageHistory[message.identifier] = unixDate;

    if (
      message.toInstanceId !==
      ApplicationParameters.applicationInstanceIdentifier
    ) {
      Logger.post(
        'Error reading message. Message addressed to another instance of id "{instanceId}": {line}',
        {
          instanceId: message.toInstanceId,
          line: fileLine
        },
        LogLevel.Warning,
        MessageRouter.logContext
      );

      return undefined;
    }

    return message;
  }

  /**
   * Valida um conteúdo e entrega a instância de uma mensagem.
   */
  public static parse(
    content: string
  ): (Message & IMessageToInstance) | undefined {
    try {
      const json = JSON.parse(content) as Partial<IMessageToInstance>;

      if (
        Object.keys(json).includes('name') ||
        json.identifier === undefined ||
        json.type === undefined ||
        json.fromInstanceId === undefined ||
        json.toInstanceId === undefined
      ) {
        Logger.post(
          'Error reading message. Invalid fields in JSON: {content}',
          {
            content
          },
          LogLevel.Warning,
          MessageRouter.logContext
        );

        return undefined;
      }

      const messageConstructor = MessageRouter.wellKnowMessages.find(
        data => data[1].name === json.type
      );
      if (messageConstructor === undefined) {
        Logger.post(
          'Error reading message. Invalid type "{messageType}" in message: {content}',
          {
            messageType: json.type,
            content
          },
          LogLevel.Warning,
          MessageRouter.logContext
        );

        return undefined;
      }

      return Object.assign(
        new messageConstructor[1](json.fromInstanceId, json.toInstanceId),
        json
      );
    } catch (error) {
      Logger.post(
        'Error reading message. Error "{error}" when parsing JSON: {content}',
        {
          error,
          content
        },
        LogLevel.Warning,
        MessageRouter.logContext
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
  ): IMessageToInstance {
    const wellKnowMessage = MessageRouter.wellKnowMessages.find(
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
  public static async send(message: IMessageToInstance): Promise<void> {
    return new Promise<void>(resolve => {
      const messageClone = JSON.parse(JSON.stringify(message)) as Record<
        string,
        unknown
      >;
      delete messageClone['name'];
      const fileContent =
        `${new Date().toISOString()} ${JSON.stringify(messageClone)}` + os.EOL;
      const instanceFile = ApplicationParameters.getRunningFlagFile(
        message.toInstanceId
      );

      Logger.post(
        'Send message "{messageType}" to instance "{instanceId}" appending into file: {instanceFile}.',
        {
          messageType: message.type,
          instanceId: message.toInstanceId,
          instanceFile
        },
        LogLevel.Debug,
        MessageRouter.logContext
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
      let toInstanceFile =
        ApplicationParameters.getRunningFlagFile(toInstanceId);
      if (fs.existsSync(toInstanceFile)) {
        toInstanceFile = fs.realpathSync(toInstanceFile);
        affectedCount++;

        const message = MessageRouter.factory(
          executionMode,
          fromInstanceId,
          toInstanceId
        );

        await MessageRouter.send(message);
      } else {
        Logger.post(
          'Instance "{instanceId}" is not running to receive messages.',
          {
            instanceId: toInstanceId
          },
          LogLevel.Warning,
          MessageRouter.logContext
        );
      }
    }

    return affectedCount;
  }
}
