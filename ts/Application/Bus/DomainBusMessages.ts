import { AttachMessagesToBus } from "../../Bus/Message/AttachMessagesToBus";
import { ExchangeCoinMessage } from "../../Coin/BusMessage/ExchangeCoinMessage";
import { LockSynchronization } from "../../Lock/LockSynchronization";
import { UserMessageDeliveryReceipt } from "../../UserInteraction/BusMessage/UserMessageDeliveryReceipt";

/**
 * Mensagens de domínio para o Bus.
 */
export class DomainBusMessages {
  /**
   * Anexa as mensagens para o Bus poder tratar.
   */
  public static attach(): void {
    void new AttachMessagesToBus(
      ExchangeCoinMessage,
      UserMessageDeliveryReceipt
    ).send();
    LockSynchronization.attachMessagesToBus();
  }
}
