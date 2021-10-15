import { GenericError } from "@sergiocabral/helper";

/**
 * Erro de protocolo.
 */
export class ProtocolError extends GenericError {
  /**
   * Corpo da mensagem em branco.
   */
  public static BLANK_MESSAGE_BODY = 4001;

  /**
   * Erro na camada superior.
   */
  public static TOP_LAYER_ERROR = 4100;

  /**
   * Erro desconhecido.
   */
  public static UNKNOWN_ERROR = 4000;

  /**
   * Protocolo não suportado.
   */
  public static VERSION_NOT_SUPPORTED = 4002;

  /**
   * Mensagem codificada de forma errada.
   */
  public static WRONGLY_ENCODED_MESSAGE = 4003;

  /**
   * Cria uma instância de erro.
   * @param code Código de erro.
   * @param innerError Erro mais interno.
   */
  public static create(code: number, innerError?: unknown): ProtocolError {
    let message = ProtocolError.messages[code];
    if (!message) {
      code = ProtocolError.UNKNOWN_ERROR;
      message = ProtocolError.messages[code];
    }

    return new ProtocolError(code, message, innerError);
  }

  /**
   * Descrições de códigos de erro.
   */
  private static readonly messages: Record<number, string> = {
    [ProtocolError.BLANK_MESSAGE_BODY]: "Blank message body",
    [ProtocolError.VERSION_NOT_SUPPORTED]: "Version not supported",
    [ProtocolError.UNKNOWN_ERROR]: "Unknown error",
    [ProtocolError.WRONGLY_ENCODED_MESSAGE]: "Wrongly encoded message",
  };

  /**
   * Construtor.
   * @param code Código de erro.
   * @param message Mensagem do erro.
   * @param innerError Erro mais interno.
   */
  public constructor(
    public readonly code: number,
    message: string,
    innerError?: unknown
  ) {
    super(message, innerError, "ProtocolError");
  }
}
