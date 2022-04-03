import { Application } from '../Core/Application';
import { SampleAppConfiguration } from './SampleAppConfiguration';

/**
 * Aplicação vazia de exemplo.
 */
export class SampleApp extends Application<SampleAppConfiguration> {
  /**
   * Sinaliza que deve finaliza a aplicação.
   */
  private signalToTerminate = false;

  /**
   * Tipo da Configurações da aplicação;
   */
  protected override configurationType = SampleAppConfiguration;

  /**
   * Inicia a aplicação.
   */
  protected override async start(): Promise<void> {
    const appName = this.argument.applicationName;

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

    await this.loop();
  }

  /**
   * Finaliza a aplicação.
   */
  protected override stop(): void {
    this.signalToTerminate = true;
  }

  /**
   * Loop para manter a execução da aplicação.
   */
  private async loop(): Promise<void> {
    return new Promise<void>(resolve => {
      let count = 0;
      const loop = () => {
        console.debug(`Loop ${++count}`);
        if (this.signalToTerminate) {
          resolve();
        } else {
          setTimeout(loop, 1000);
        }
      };
      setImmediate(loop);
    });
  }
}
