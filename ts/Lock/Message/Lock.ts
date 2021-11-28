import { HelperObject, Message } from "@sergiocabral/helper";
import sha1 from "sha1";

import { Definition } from "../../Definition";
import { LockResult } from "../LockResult";

/**
 * Tenta realizar um bloqueio para sincronização de clientes do Bus.
 */
export class Lock extends Message {
  /**
   * Lista de callback executados em caso de sucesso no lock.
   */
  public readonly callbacks = new Set<(() => Promise<void>) | (() => void)>();

  /**
   * Sinaliza se o bloqueio foi realizado
   */
  public result: LockResult = LockResult.None;

  /**
   * Identificador do lock.
   */
  private idValue = "";

  /**
   * Contrutor.
   * @param acquireTimeoutInSeconds Espera limite para conseguir o bloqueio.
   * @param releaseTimeoutInSeconds Espera de espera antes de liberar.
   * @param data Adiciona informação ao lock.
   */
  public constructor(
    public readonly acquireTimeoutInSeconds: number = Definition.LOCK_TIMEOUT_ACQUIRE_IN_SECONDS,
    public readonly releaseTimeoutInSeconds: number = Definition.LOCK_TIMEOUT_RELEASE_IN_SECONDS,
    data?: unknown
  ) {
    super();

    this.with(data);
  }

  /**
   * Identificador do lock
   */
  public get id() {
    return this.idValue;
  }

  /**
   * Função executada se houver êxito no lock.
   */
  public execute(callback: (() => Promise<void>) | (() => void)): this {
    this.callbacks.add(callback);

    return this;
  }

  /**
   * Adiciona informações ao lock.
   * @param data Adiciona informação ao lock.
   */
  public with(data: unknown): this {
    if (data !== undefined) {
      this.idValue = sha1(`${this.idValue}${HelperObject.toText(data, 0)}`);
    }

    return this;
  }
}
