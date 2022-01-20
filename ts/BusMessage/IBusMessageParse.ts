import { BusMessage } from './BusMessage';

/**
 * Interface para classes que analisam tipo da mensagem.
 */
export interface IBusMessageParse {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  parse(instance: unknown): BusMessage | undefined;
}
