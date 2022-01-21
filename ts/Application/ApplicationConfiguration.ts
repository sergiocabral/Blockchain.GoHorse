import { TranslateConfiguration } from '@gohorse/npm-i18n';
import { JsonLoader } from '@sergiocabral/helper';

/**
 * Configurações comuns a tudo.
 */
export class ApplicationConfiguration extends JsonLoader {
  /**
   * Configurações de idioma.
   */
  public language = new TranslateConfiguration();
}
