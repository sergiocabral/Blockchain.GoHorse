import { ApplicationExecutionMode } from '../Core/ApplicationExecutionMode';
import { InvalidArgumentError } from '@sergiocabral/helper';
import { MessageToInstance } from './MessageToInstance';
import { Kill } from './Kill';
import { ReloadConfiguration } from './ReloadConfiguration';
import { IMessageToInstance } from './IMessageToInstance';
import { ApplicationParameters } from '../Core/ApplicationParameters';
import fs from 'fs';

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
   * Menagens conhecidas
   */
  private static wellKnowMessages: Array<
    [ApplicationExecutionMode, MessageToInstanceConstructor]
  > = [
    [ApplicationExecutionMode.Kill, Kill],
    [ApplicationExecutionMode.ReloadConfiguration, ReloadConfiguration]
  ];

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
      fs.appendFileSync(instanceFile, fileContent);
      resolve();
    });
  }
}
