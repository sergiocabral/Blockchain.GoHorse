import { DatabaseConfiguration } from '../DatabaseConfiguration';
import { Definition } from './Definition';
import { GlobalDefinition } from '@gohorse/npm-core';

/**
 * Configuração para conexão com o banco de dados ElasticSearch
 */
export class ElasticSearchDatabaseConfiguration extends DatabaseConfiguration {
  /**
   * Nome do Index.
   */
  public indexPrefixPattern = `${GlobalDefinition.INTERNET_DOMAIN_FOR_GOHORSE}-{appName}-{date}`;

  /**
   * Servidor.
   */
  public server = Definition.DEFAULT_ELASTICSEARCH_SERVER;

  /**
   * Porta.
   */
  public port = Definition.DEFAULT_ELASTICSEARCH_PORT;

  /**
   * Protocolo.
   */
  public protocol = Definition.DEFAULT_ELASTICSEARCH_PROTOCOL;

  /**
   * Usuário.
   */
  public username?: string | null = Definition.DEFAULT_ELASTICSEARCH_USER;

  /**
   * Senha.
   */
  public password?: string | null = Definition.DEFAULT_ELASTICSEARCH_PASSWORD;
}
