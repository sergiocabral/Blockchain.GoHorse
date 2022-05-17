import { MessageToOtherInstance } from './MessageToOtherInstance';
import fs from 'fs';
import { Logger, LogLevel } from '@sergiocabral/helper';

/**
 * Finaliza outra instância.
 */
export class KillOtherInstance extends MessageToOtherInstance {
  /**
   * Contexto do log.
   */
  private static logContext2 = 'KillOtherInstance';

  /**
   * Envia a mensagem.
   */
  public override send(): void {
    // TODO: Continuar daqui. Fazer o tratamento comum de send na classe pai para postar comando.

    try {
      fs.unlinkSync(this.instanceFile);

      Logger.post(
        'Terminated instance "{instanceId}" by deleting execution signal file: {instanceFile}',
        {
          instanceId: this.instanceId,
          instanceFile: this.instanceFile
        },
        LogLevel.Information,
        KillOtherInstance.logContext2
      );
    } catch (error) {
      Logger.post(
        'Error to terminate instance "{instanceId}" by deleting execution signal file: {instanceFile}. ERROR: {error}',
        {
          instanceId: this.instanceId,
          instanceFile: this.instanceFile,
          error
        },
        LogLevel.Error,
        KillOtherInstance.logContext2
      );
    }
  }
}
