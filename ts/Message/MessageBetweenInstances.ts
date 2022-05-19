import { ApplicationExecutionMode } from '../Core/ApplicationExecutionMode';
import { KillOtherInstance } from './KillOtherInstance';
import { ReloadConfigurationOfOtherInstance } from './ReloadConfigurationOfOtherInstance';
import { InvalidArgumentError } from '@sergiocabral/helper';
import fs from 'fs';
import { ApplicationParameters } from '../Core/ApplicationParameters';

/**
 * Tipo para o construtor de MessageBetweenInstances
 */
type MessageBetweenInstancesConstructor = new (
  fromInstanceId: string,
  toInstanceId: string
) => MessageBetweenInstances;

/**
 * Base abstrata das mensagens entre instâncias.
 */
export abstract class MessageBetweenInstances {
  /**
   * Contexto do log.
   */
  private static logContext2 = 'MessageBetweenInstances';

  /**
   * Menagens conhecidas
   */
  private static wellKnowMessages: Array<
    [ApplicationExecutionMode, MessageBetweenInstancesConstructor]
  > = [
    [ApplicationExecutionMode.Kill, KillOtherInstance],
    [
      ApplicationExecutionMode.ReloadConfiguration,
      ReloadConfigurationOfOtherInstance
    ]
  ]; // TODO: Referencia circular.

  /**
   * Construtor.
   * @param fromInstanceId Instância remetente da mensagem
   * @param toInstanceId Instância que recebe a mensagem
   */
  public constructor(
    public readonly fromInstanceId: string,
    public readonly toInstanceId: string
  ) {}

  /**
   * Envia a mensagem.
   */
  public send(): Promise<void> {
    return new Promise<void>(resolve => {
      const message = '{}'; // TODO: Prencher a mensagem.
      const fileContent = `${new Date().getTime()}:${JSON.stringify(message)}`;
      const instanceFile = ApplicationParameters.getRunningFlagFile(
        this.toInstanceId
      );
      fs.appendFileSync(instanceFile, fileContent);
      resolve();
    });
  }

  /**
   * Retorna a mensagem correspondente ao modo de execução.
   */
  public static factory(
    executionMode: ApplicationExecutionMode,
    fromInstanceId: string,
    toInstanceId: string
  ): MessageBetweenInstances {
    const wellKnowMessage = MessageBetweenInstances.wellKnowMessages.find(
      item => item[0] === executionMode
    );

    if (wellKnowMessage === undefined) {
      throw new InvalidArgumentError('Invalid executionMode');
    }

    const messageConstructor = wellKnowMessage[1];

    return new messageConstructor(fromInstanceId, toInstanceId);
  }
}
