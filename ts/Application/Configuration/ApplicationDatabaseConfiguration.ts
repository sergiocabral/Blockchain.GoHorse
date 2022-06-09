import { JsonLoader } from '@sergiocabral/helper';
import { ElasticSearchDatabaseConfiguration } from '@gohorse/npm-database-elaticsearch';

/**
 * Configurações dos bancos de dados da aplicação.
 */
export class ApplicationDatabaseConfiguration extends JsonLoader {
  /**
   * Log para console.
   */
  public elasticsearch = new ElasticSearchDatabaseConfiguration().setName(
    'elasticsearch',
    this
  );
}
