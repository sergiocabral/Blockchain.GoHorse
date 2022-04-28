import { Application } from '../Core/Application';
import { SampleAppConfiguration } from './SampleAppConfiguration';

/**
 * Aplicação vazia de exemplo.
 */
export class SampleApp extends Application<SampleAppConfiguration> {
  /**
   * Tipo da Configurações da aplicação;
   */
  protected override configurationType = SampleAppConfiguration;

  /**
   * Inicia a aplicação.
   */
  protected override async onStart(): Promise<void> {
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

    const steps = 10;
    const interval = 1000;

    return new Promise<void>(resolve => {
      let step = 0;
      const loop = () => {
        console.info(`Tick ${++step}/${steps}`);
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
    }
  }

  /**
   * Timeout do loop.
   */
  private timeout?: NodeJS.Timeout;
}
