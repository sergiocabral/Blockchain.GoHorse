import { InvalidExecutionError, NotReadyError } from "@sergiocabral/helper";

import { IProtocol } from "./Protocol/IProtocol";

/**
 * Classe base para implementação da comunicação de servidor e cliente websocket.
 */
export abstract class WebSocketBase<TInstance> {
  /**
   * Valor da instância.
   */
  private instanceValue: TInstance | undefined = undefined;

  /**
   * Construtor.
   * @param protocol Protocolo de comunicação.
   */
  public constructor(protected readonly protocol: new () => IProtocol) {}

  /**
   * Instância do websocket.
   */
  protected get instance(): TInstance {
    if (this.instanceValue === undefined) {
      throw new NotReadyError("Websocket instance was not defined.");
    }

    return this.instanceValue;
  }
  /**
   * Instância do websocket.
   */
  protected set instance(value: TInstance) {
    if (this.instanceValue !== null) {
      throw new InvalidExecutionError("Websocket instance already defined.");
    }
    this.instanceValue = value;
  }

  /**
   * Inicia a instância para permitir conexões.
   */
  public abstract start(): void;

  /**
   * Finaliza a instância e encerrar conexões.
   */
  public abstract stop(): void;

  /**
   * Define o valor da instância do websocket para undefined.
   */
  protected resetInstance(): void {
    this.instanceValue = undefined;
  }
}
