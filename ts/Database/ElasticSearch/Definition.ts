import { GlobalDefinition } from '@gohorse/npm-core';

/**
 * Definições hard-coded.
 */
export class Definition {
  /**
   * Serviço padrão do elasticsearch. Url.
   */
  public static readonly DEFAULT_ELASTICSEARCH_SERVER = `elasticsearch.${GlobalDefinition.INTERNET_DOMAIN_FOR_GOHORSE}`;

  /**
   * Serviço padrão do elasticsearch. Protocol.
   */
  public static readonly DEFAULT_ELASTICSEARCH_PROTOCOL = 'https';

  /**
   * Serviço padrão do elasticsearch. Porta.
   */
  public static readonly DEFAULT_ELASTICSEARCH_PORT = 443;

  /**
   * Serviço padrão do elasticsearch. Usuário.
   */
  public static readonly DEFAULT_ELASTICSEARCH_USER = 'guest';

  /**
   * Serviço padrão do elasticsearch. Password.
   */
  public static readonly DEFAULT_ELASTICSEARCH_PASSWORD =
    GlobalDefinition.WELL_KNOWN_PASSWORD;
}
