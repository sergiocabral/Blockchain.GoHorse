import {
  EmptyError,
  InvalidDataError,
  InvalidExecutionError,
  Message,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

import { BusDatabase } from "../Bus/BusDatabase";
import { AttachMessagesToBus } from "../Bus/Message/AttachMessagesToBus";
import { SendBusMessage } from "../Bus/Message/SendBusMessage";

import { LockResponse } from "./BusMessage/LockResponse";
import { RequestLock } from "./BusMessage/RequestLock";
import { ILockData } from "./ILockData";
import { LockResult } from "./LockResult";
import { Lock } from "./Message/Lock";

/**
 * Bloqueio para sincronização de acesso.
 */
export class LockSynchronization {
  /**
   * Instância de banco de dados.
   */
  public static get database(): BusDatabase {
    if (LockSynchronization.databaseValue === undefined) {
      throw new EmptyError(
        `The database instance was not defined for ${LockSynchronization.name}`
      );
    }

    return LockSynchronization.databaseValue;
  }

  /**
   * Instância de banco de dados.
   */
  public static set database(value: BusDatabase) {
    LockSynchronization.databaseValue = value;
  }

  /**
   * Anexa as mensagens relacionadas ao bus.
   */
  public static attachMessagesToBus(): void {
    void new AttachMessagesToBus(LockResponse, RequestLock).send();
  }

  /**
   * Inicializa o serviço de bloqueio.
   */
  public static initialize() {
    if (LockSynchronization.instance !== undefined) {
      throw new InvalidExecutionError("The Lock already initialized.");
    }
    LockSynchronization.instance = new LockSynchronization();
  }

  /**
   * Instância de banco de dados.
   */
  private static databaseValue?: BusDatabase;

  /**
   * Serviço de bloqueio (singleton).
   */
  private static instance?: LockSynchronization;

  /**
   * Handle: RequestLock
   */
  private static async handleRequestLock(message: RequestLock): Promise<void> {
    if (message.clientId === undefined) {
      throw new ShouldNeverHappenError();
    }

    message.lock.result = (await LockSynchronization.database.lock(
      message.lock.id,
      message.clientId,
      true
    ))
      ? LockResult.Locked
      : LockResult.Cannot;

    message.response = new LockResponse(message.lock);
  }

  /**
   * Lista de locks.
   */
  private readonly locks = new Map<string, ILockData>();

  /**
   * Construtor.
   */
  private constructor() {
    Message.subscribe(Lock, this.handleLock.bind(this));
    Message.subscribe(LockResponse, this.handleLockResponse.bind(this));
    Message.subscribe(
      RequestLock,
      LockSynchronization.handleRequestLock.bind(LockSynchronization)
    );
  }

  /**
   * Handle: Lock
   */
  private async handleLock(message: Lock): Promise<void> {
    const lockId = message.id;

    if (!lockId) {
      throw new InvalidDataError(
        "The Lock has not received information to lock."
      );
    }

    if (this.locks.has(lockId)) {
      throw new InvalidExecutionError(
        `The Lock ${lockId} has already been requested.`
      );
    }

    const lock: ILockData = {
      id: lockId,
      lock: message,
    };

    this.locks.set(lock.id, lock);

    return new Promise((resolve) => {
      const lockResolve = (lock.resolve = (locked: LockResult) => {
        if (this.locks.delete(lock.id)) {
          message.result = locked;
          resolve();
        }
      });

      setTimeout(() => lockResolve(LockResult.Timeout), message.timeout);

      new SendBusMessage(new RequestLock(message)).send();
    });
  }

  /**
   * Handle: LockResponse
   */
  private handleLockResponse(message: LockResponse): void {
    const lock = this.locks.get(message.lock.id);
    if (lock?.resolve !== undefined) {
      lock.resolve(message.lock.result);
    }
  }
}
