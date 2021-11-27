import { JsonLoader } from "@sergiocabral/helper";

import { TranslateConfiguration } from "../Translation/TranslateConfiguration";

/**
 * Configurações comuns a tudo.
 */
export class ApplicationConfiguration extends JsonLoader {
  /**
   * Configurações de idioma.
   */
  public language = new TranslateConfiguration();
}
