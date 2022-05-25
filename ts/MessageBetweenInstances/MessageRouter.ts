import { ApplicationExecutionMode } from '../Core/ApplicationExecutionMode';
import {
  EmptyError,
  FileSystemMonitoring,
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message
} from '@sergiocabral/helper';
import { MessageToInstance } from './MessageToInstance';
import { Kill } from './Kill';
import { ReloadConfiguration } from './ReloadConfiguration';
import { IMessageToInstance } from './IMessageToInstance';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import fs from 'fs';
import { IFileSystemMonitoringEventData } from '@sergiocabral/helper/js/IO/FileSystem/IFileSystemMonitoringEventData';

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
    [ApplicationExecutionMode.Kill, Kill],
    [ApplicationExecutionMode.ReloadConfiguration, ReloadConfiguration]
  ];

  /**
   * Construtor.
   * @param messageFileMonitoring Monitoramento do arquivo de mensagens.
   */
  public constructor(private messageFileMonitoring: FileSystemMonitoring) {
    messageFileMonitoring.onModified.add(
      this.onModifiedRunningFlagFile.bind(this)
    );
  }

  /**
   * Evento ao modificar o arquivo de sinalização de execução.
   * @param success Sucesso da operação.
   * @param data Dados associados ao evento.
   */
  private onModifiedRunningFlagFile(
    success: boolean,
    data?: IFileSystemMonitoringEventData
  ): void {
    if (!success || data === undefined) {
      throw new InvalidExecutionError('Expected onModified with success.');
    }
    Logger.post(
      'The execution signal file was modified: {path}',
      {
        path: data.after.realpath
      },
      LogLevel.Debug,
      MessageRouter.logContext
    );
    // TODO: Implementar leitura das mensagens.
  }

  /**
   * Valida um conteúdo e entrega a instância de uma mensagem.
   */
  public static parse(content: string): Message | undefined {
    // TODO: Implementar o parse
    return undefined;
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
      const fileContent = `${new Date().getTime()}:${JSON.stringify(message)}`;
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
