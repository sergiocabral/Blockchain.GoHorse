import { IBusMessage } from "./IBusMessage";

/**
 * Interface para classes que analisam tipo da mensagem.
 */
export interface IBusMessageParse {
  /**
   * Analisa se uma instância corresponde ao tipo.
   * @param instance Instância.
   */
  parse(instance: unknown): IBusMessage | undefined;
}
