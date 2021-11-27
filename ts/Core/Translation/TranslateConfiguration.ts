import { JsonLoader } from "@sergiocabral/helper";

import { Definition } from "../../Definition";
import { JsonLoaderFieldErrors } from "../JsonLoaderFieldErrors";

/**
 * Configurações de idioma.
 */
export class TranslateConfiguration extends JsonLoader {
  /**
   * Idioma utilizado caso o idioma selecionado não possa ser traduzido.
   */
  public fallback?: string | null = Definition.DEFAULT_LANGUAGE;

  /**
   * Idioma selecionado.
   */
  public selected?: string | null = Definition.DEFAULT_LANGUAGE;

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "fallback"));
    errors.push(...JsonLoaderFieldErrors.canEmptyString(this, "selected"));
    errors.push(...super.errors());

    return errors;
  }
}
