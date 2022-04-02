import { Argument } from '@gohorse/npm-core';
import {
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import fs from 'fs';
import { Definition } from './Definition';
import { IApplication } from './IApplication';

/**
 * Classe principal com o ponto de entrada da execução.
 */
export class Main {
  /**
   * Aplicação selecionada para execução.
   */
  public static async start(
    applicationConstructor: new () => IApplication
  ): Promise<void> {
    if (Main.instance !== undefined) {
      throw new InvalidExecutionError(
        'Main cannot be instantiated more than once.'
      );
    }

    Main.instance = new Main();
    const application = new applicationConstructor();

    const killFilename = `KILL.${Argument.getApplicationName()}`;
    if (fs.existsSync(killFilename)) {
      fs.unlinkSync(killFilename);
    }

    if (!Argument.hasStopArgument()) {
      try {
        await application.run();
      } catch (error: unknown) {
        await application.stop();
        throw error;
      }

      const killVerifyIntervalTimer = setInterval(async () => {
        if (fs.existsSync(killFilename)) {
          clearInterval(killVerifyIntervalTimer);

          fs.unlinkSync(killFilename);

          Logger.post(
            'Signal received to terminate application.',
            undefined,
            LogLevel.Information,
            Main.name
          );

          await application.stop();
        }
      }, Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE_IN_MILLISECONDS);

      application.onStop.add(() => clearInterval(killVerifyIntervalTimer));
    } else {
      Logger.post(
        'Sending signal to terminate application.',
        undefined,
        LogLevel.Information,
        Main.name
      );

      fs.writeFileSync(killFilename, '');
    }
  }

  /**
   * Instância única da classe.
   */
  private static instance?: Main;

  /**
   * Construtor privado.
   */
  private constructor() {
    // Singleton
  }
}
