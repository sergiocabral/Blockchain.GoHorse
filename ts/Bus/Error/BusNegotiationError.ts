import { GenericError } from "@sergiocabral/helper";

/**
 * Erro para negociação de mensagem pelo Bus.
 */
export class BusNegotiationError extends GenericError {
  /**
   * Construtor.
   * @param message Mensagem de erro.
   * @param innerError Erro original.
   */
  public constructor(
    message?: string,
    public innerError?: Error | GenericError | unknown
  ) {
    super(message, innerError, BusNegotiationError.name);
  }
}
