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
  public static readonly TRANSLATE_FILE_PREFIX = 'translation';

  /**
   * Nome padrão do diretório node_modules do NodeJS.
   */
  public static readonly DIRECTORY_NAME_FOR_NODE_MODULES = 'node_modules';

  /**
   * Nome padrão do diretório dos pacotes @gohorse.
   */
  public static readonly DIRECTORY_NAME_FOR_GOHORSE = '@gohorse';
}
