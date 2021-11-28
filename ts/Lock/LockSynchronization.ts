import {
  EmptyError,
  InvalidDataError,
  InvalidExecutionError,
  Logger,
  LogLevel,
  Message,
  ShouldNeverHappenError,
} from "@sergiocabral/helper";

import { BusDatabase } from "../Bus/BusDatabase";
import { AttachMessagesToBus } from "../Bus/Message/AttachMessagesToBus";
import { SendBusMessage } from "../Bus/Message/SendBusMessage";
import { Definition } from "../Definition";

import { LockResponse } from "./BusMessage/LockResponse";
import { SetLock } from "./BusMessage/SetLock";
import { ILockData } from "./ILockData";
import { LockAction } from "./LockAction";
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
    void new AttachMessagesToBus(LockResponse, SetLock).send();
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
  private static async handleSetLock(message: SetLock): Promise<void> {
    if (message.clientId === undefined) {
      throw new ShouldNeverHappenError();
    }

    switch (message.action) {
      case LockAction.Acquire:
        message.lock.result = (await LockSynchronization.database.lock(
          message.lock.id,
          message.clientId
        ))
          ? LockResult.Locked
          : LockResult.Cannot;
        break;

      case LockAction.Release:
        message.lock.result = (await LockSynchronization.database.lock(
          message.lock.id,
          message.clientId,
          message.lock.releaseTimeoutInSeconds
        ))
          ? LockResult.Released
          : LockResult.Fail;
        break;

      default:
        throw new InvalidExecutionError(
          `Invalid Lock action: ${message.action}`
        );
    }

    Logger.post(
      'The "{clientId}" client requested "{action}" for "{lockId}" lock. Result: {state}',
      {
        action: message.action,
        clientId: message.clientId,
        lockId: message.lock.id,
        state: message.lock.result,
      },
      LogLevel.Debug,
      LockSynchronization.name
    );

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
      SetLock,
      LockSynchronization.handleSetLock.bind(LockSynchronization)
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
      Logger.post(
        "The Lock {lockId} has already been requested.",
        {
          lockId,
        },
        LogLevel.Warning,
        LockSynchronization.name
      );

      return;
    }

    Logger.post(
      'Lock "{lockId}" {state}. Created.',
      {
        lockId,
        state: message.result,
      },
      LogLevel.Verbose,
      LockSynchronization.name
    );

    message.result = LockResult.Waiting;

    const lock: ILockData = {
      expectedResult: [],
      id: lockId,
      lock: message,
    };

    this.locks.set(lock.id, lock);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(
        async () => lockResolve(LockResult.Timeout),
        message.acquireTimeoutInSeconds * Definition.ONE_SECOND_IN_MILLISECOND
      );

      const lockResolve = (lock.resolve = async (locked: LockResult) => {
        if (!lock.expectedResult.includes(locked)) {
          throw new InvalidExecutionError(
            `Lock result not expected: ${locked}`
          );
        }

        message.result = locked;

        switch (locked) {
          case LockResult.Locked:
            Logger.post(
              'Lock "{lockId}" {state}. Executing statements.',
              {
                lockId,
                state: message.result,
              },
              LogLevel.Debug,
              LockSynchronization.name
            );

            for (const callback of message.callbacks) {
              await callback();
            }
            lock.expectedResult = [LockResult.Released, LockResult.Timeout];

            await new SendBusMessage(
              new SetLock(message, LockAction.Release)
            ).sendAsync();

            Logger.post(
              'Lock "{lockId}" {state}. Trying release.',
              {
                lockId,
                state: message.result,
              },
              LogLevel.Verbose,
              LockSynchronization.name
            );
            break;

          case LockResult.Cannot:
          case LockResult.Timeout:
          case LockResult.Released:
            clearTimeout(timeoutId);
            this.locks.delete(lock.id);
            lock.expectedResult = [];

            Logger.post(
              'Lock "{lockId}" {state}. Finished.',
              {
                lockId,
                state: message.result,
              },
              LogLevel.Debug,
              LockSynchronization.name
            );

            resolve();
            break;

          default:
            throw new InvalidExecutionError(`Invalid lock result: ${locked}`);
        }
      });

      lock.expectedResult = [
        LockResult.Locked,
        LockResult.Cannot,
        LockResult.Timeout,
      ];
      new SendBusMessage(new SetLock(message, LockAction.Acquire)).send();

      Logger.post(
        'Lock "{lockId}" {state}. Trying acquire.',
        {
          lockId,
          state: message.result,
        },
        LogLevel.Debug,
        LockSynchronization.name
      );
    });
  }

  /**
   * Handle: LockResponse
   */
  private async handleLockResponse(message: LockResponse): Promise<void> {
    const lock = this.locks.get(message.lock.id);
    if (lock?.resolve !== undefined) {
      await lock.resolve(message.lock.result);
    }
  }
}
