import { BusMessage } from "./BusMessage/BusMessage";

/**
 * Criação de mensagens para o Bus.
 */
export interface ICreateBusMessage {
  /**
   * Criar uma mensagem do Bus a partir de uma mensagem desconhecida recebida pelo Bus.
   * @param message Mensagem desconhecida.
   */
  fromReceivedMessage(message: unknown | undefined): BusMessage | undefined;
}
