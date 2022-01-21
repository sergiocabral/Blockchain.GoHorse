import { AttachMessagesToBus, LockSynchronization } from '@gohorse/npm-bus';
import { IBusMessageParse } from '@gohorse/npm-bus/js/BusMessage/IBusMessageParse';

/**
 * Mensagens de domínio para o Bus.
 */
export class DomainBusMessages {
  /**
   * Anexa as mensagens para o Bus poder tratar.
   */
  public static attach(messagesTypes: IBusMessageParse[]): void {
    void new AttachMessagesToBus(...messagesTypes).send();
    LockSynchronization.attachMessagesToBus();
  }
}
