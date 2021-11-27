import {
  HelperObject,
  InvalidExecutionError,
  Message,
} from "@sergiocabral/helper";
import sha1 from "sha1";

import { Definition } from "../../Definition";
import { LockResult } from "../LockResult";

/**
 * Tenta realizar um bloqueio para sincronização de clientes do Bus.
 */
export class Lock extends Message {
  /**
   * Identificador do lock.
   */
  private idValue = "";

  /**
   * Sinaliza se o bloqueio foi realizado
   */
  private resultValue?: LockResult;

  /**
   * Contrutor.
   * @param timeout Tempo limite para esperar pelo bloqueio.
   * @param data Adiciona informação ao lock.
   */
  public constructor(
    public readonly timeout: number = Definition.LOCK_TIMEOUT,
    data?: unknown
  ) {
    super();

    if (data !== undefined) {
      this.with(data);
    }
  }

  /**
   * Identificador do lock
   */
  public get id() {
    return this.idValue;
  }

  /**
   * Sinaliza se o bloqueio foi realizado
   */
  public get result() {
    return this.resultValue ?? LockResult.Waiting;
  }

  /**
   * Sinaliza se o bloqueio foi realizado
   */
  public set result(value: LockResult) {
    if (this.resultValue !== undefined) {
      throw new InvalidExecutionError("It is not allowed to set lock twice.");
    }

    this.resultValue = value;
  }

  /**
   * Adiciona informações ao lock.
   * @param data Adiciona informação ao lock.
   */
  public with(data: unknown): this {
    this.idValue = sha1(`${this.idValue}${HelperObject.toText(data, 0)}`);

    return this;
  }
}
