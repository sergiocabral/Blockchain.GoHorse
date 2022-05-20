import { ApplicationExecutionMode } from '../Core/ApplicationExecutionMode';
import { InvalidArgumentError } from '@sergiocabral/helper';
import {
  MessageToInstance,
  MessageToInstanceConstructor
} from './MessageToInstance';
import { Kill } from './Kill';
import { ReloadConfiguration } from './ReloadConfiguration';

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
  ): MessageToInstance {
    const wellKnowMessage = MessageRouter.wellKnowMessages.find(
      item => item[0] === executionMode
    );

    if (wellKnowMessage === undefined) {
      throw new InvalidArgumentError('Invalid executionMode');
    }

    const messageConstructor = wellKnowMessage[1];

    return new messageConstructor(fromInstanceId, toInstanceId);
  }
}
