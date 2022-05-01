import { Application } from '../Core/Application';
import { SampleAppConfiguration } from './SampleAppConfiguration';
import { Logger, LogLevel } from '@sergiocabral/helper';

/**
 * Aplicação vazia de exemplo.
 */
export class SampleApp extends Application<SampleAppConfiguration> {
  /**
   * Contexto do log.
   */
  private static logContext = 'SampleApp';

  /**
   * Tipo da Configurações da aplicação;
   */
  protected override configurationType = SampleAppConfiguration;

  /**
   * Inicia a aplicação.
   */
  protected override async onStart(): Promise<void> {
    Logger.post(
      'Application up.',
      undefined,
      LogLevel.Information,
      SampleApp.logContext
    );

    const appName = this.parameters.applicationName;

    console.info(`      ____`);
    console.info(`     /  __\\           ____`);
    console.info(`     \\( oo           (___ \\`);
    console.info(`     _\\_o/  this is   oo~)/`);
    console.info(`    / \\|/ \\ a sample  \\-_/_`);
    console.info(`   / / __\\ \\___ app / \\|/  \\`);
    console.info(`   \\ \\|   |__/_)   / / .- \\ \\`);
    console.info(`    \\/_)  |        \\ \\ .  /_/`);
    console.info(`     ||___|         \\/___(_/`);
    console.info(`     | | |           | |  |`);
    console.info(`     | | |           | |  |`);
    console.info(`     |_|_|           |_|__|`);
    console.info(`     [__)_)         (_(___] ${appName}`);
    console.info(``);

    const steps = parseInt(this.parameters.getArgumentName(/^\d+$/) ?? '15');
    const interval = 1000;

    return new Promise<void>(resolve => {
      let step = 0;
      const loop = () => {
        console.info(
          `Tick ${(++step)
            .toString()
            .padStart(steps.toString().length, '0')}/${steps}`
        );
        if (step === steps) {
          resolve();
        } else {
          this.timeout = setTimeout(loop, interval);
        }
      };
      loop();
    });
  }

  /**
   * Finaliza a aplicação.
   */
  protected override onStop(): void {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
      this.timeout = undefined;

      Logger.post(
        'Application down.',
        undefined,
        LogLevel.Information,
        SampleApp.logContext
      );
    }
  }

  /**
   * Timeout do loop.
   */
  private timeout?: NodeJS.Timeout;
}
