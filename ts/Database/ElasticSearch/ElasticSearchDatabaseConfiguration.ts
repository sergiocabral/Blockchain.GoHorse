import { DatabaseConfiguration } from '../DatabaseConfiguration';
import { Definition } from './Definition';

/**
 * Configuração para conexão com o banco de dados ElasticSearch
 */
export class ElasticSearchDatabaseConfiguration extends DatabaseConfiguration {
  /**
   * Nome do Index.
   */
  public indexPrefixPattern?: string | null = `{appName}.{timestamp}.`;

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
