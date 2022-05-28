/**
 * Definições hard-coded para este projeto.
 */
export class Definition {
  /**
   * Idioma padrão.
   * Será usado tanto para o idioma selecionado.
   * Como também para o idioma padrão caso o idioma selecionado seja inválido.
   */
  public static readonly DEFAULT_LANGUAGE = 'en-US';

  /**
   * Prefixo dos arquivos de tradução.
   * São os arquivos que serão localizados em disco e carregados.
   */
  public static readonly TRANSLATE_FILE_PREFIX = 'translate';
}
