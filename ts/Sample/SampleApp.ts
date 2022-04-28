import { Application } from '../Core/Application';
import { SampleAppConfiguration } from './SampleAppConfiguration';

/**
 * Aplicação vazia de exemplo.
 */
export class SampleApp extends Application<SampleAppConfiguration> {
  /**
   * Sinaliza loop ativo.
   */
  private isLooping = false;

  /**
   * Tipo da Configurações da aplicação;
   */
  protected override configurationType = SampleAppConfiguration;

  /**
   * Inicia a aplicação.
   */
  protected override async onStart(): Promise<void> {
    this.isLooping = true;

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

    await this.loop();

    this.isLooping = false;
  }

  /**
   * Finaliza a aplicação.
   */
  protected override onStop(): void {
    this.isLooping = false;
  }

  /**
   * Loop para manter a execução da aplicação.
   * @param steps Quantidade de loops.
   * @param interval Intevalo entre cada loop.
   */
  private async loop(steps = 10, interval = 1000): Promise<void> {
    return new Promise<void>(resolve => {
      let step = 0;
      const loop = () => {
        console.debug(`Tick ${++step}/${steps}`);
        if (!this.isLooping || step === steps) {
          resolve();
        } else {
          setTimeout(loop, interval);
        }
      };
      loop();
    });
  }
}
