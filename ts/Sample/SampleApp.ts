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
}
