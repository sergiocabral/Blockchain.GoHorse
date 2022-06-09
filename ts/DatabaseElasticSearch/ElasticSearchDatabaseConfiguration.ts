import { Definition } from '../Definition';
import { GlobalDefinition, TemplateString } from '@gohorse/npm-core';
import { JsonLoader } from '@sergiocabral/helper';
import { DatabaseConfiguration } from '@gohorse/npm-database';

/**
 * Configuração para conexão com o banco de dados ElasticSearch
 */
export class ElasticSearchDatabaseConfiguration extends DatabaseConfiguration {
  /**
   * Nome do Index.
   */
  public indexPrefixTemplate = `[${GlobalDefinition.INTERNET_DOMAIN_FOR_GOHORSE}]-[${TemplateString.VARIABLE.DATE}]-[${TemplateString.VARIABLE.APPLICATION_NAME}]`;

  /**
   * Servidor.
   */
  public server = Definition.DEFAULT_ELASTICSEARCH_SERVER;

  /**
   * Porta.
   */
  public port = Definition.DEFAULT_ELASTICSEARCH_PORT;

  /**
   * Protocolo HTTP ou HTTPS.
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

  /**
   * Lista de erros presentes na configuração atual
   */
  public override errors(): string[] {
    const errors = Array<string>();

    errors.push(
      ...JsonLoader.mustBeString<ElasticSearchDatabaseConfiguration>(
        this,
        'indexPrefixTemplate'
      ),
      ...JsonLoader.mustBeString<ElasticSearchDatabaseConfiguration>(
        this,
        'server'
      ),
      ...JsonLoader.mustBeIntegerGreaterThan<ElasticSearchDatabaseConfiguration>(
        this,
        'port',
        0
      ),
      ...JsonLoader.mustBeInTheSet<ElasticSearchDatabaseConfiguration>(
        this,
        'protocol',
        ['http', 'https'],
        'value and type',
        false
      ),
      ...JsonLoader.mustBeStringOrNotInformed<ElasticSearchDatabaseConfiguration>(
        this,
        'username'
      ),
      ...JsonLoader.mustBeStringOrNotInformed<ElasticSearchDatabaseConfiguration>(
        this,
        'password'
      )
    );

    errors.push(...super.errors());

    return errors;
  }
}
