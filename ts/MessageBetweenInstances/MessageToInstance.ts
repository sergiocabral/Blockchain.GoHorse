import fs from 'fs';
import { ApplicationParameters } from '../Core/ApplicationParameters';

/**
 * Tipo para o construtor de Message
 */
export type MessageToInstanceConstructor = new (
  fromInstanceId: string,
  toInstanceId: string
) => MessageToInstance;

/**
 * Base abstrata das mensagens entre instâncias.
 */
export abstract class MessageToInstance {
  /**
   * Contexto do log.
   */
  private static logContext2 = 'Message';

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
}
