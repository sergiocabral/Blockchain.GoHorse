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
   * Execução da aplicação.
   */
  protected override run(): void {
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
  }
}
