import { IApplicationParameters } from './IApplicationParameters';
import { ApplicationDatabaseConfiguration } from './ApplicationDatabaseConfiguration';
import { ElasticSearchDatabase } from '../Database/ElasticSearch/ElasticSearchDatabase';
import { IDatabase } from '../Database/IDatabase';

/**
 * Gerencia os banco de dados da aplicação.
 */
export class ApplicationDatabase {
  /**
   * Construtor.
   * @param getConfiguration Configurações.
   * @param getParameters Parâmetros da instância.
   */
  public constructor(
    private readonly getConfiguration: () => ApplicationDatabaseConfiguration,
    private readonly getParameters: () => IApplicationParameters
  ) {
    this.elasticsearch = new ElasticSearchDatabase(
      () => this.getConfiguration().elasticsearch
    );
  }

  /**
   * Lista de banco de dados.
   */
  public get databases(): IDatabase[] {
    return [this.elasticsearch];
  }

  /**
   * ElasticSearch
   */
  public readonly elasticsearch: ElasticSearchDatabase;

  /**
   * Abre as conexões.
   */
  public async open(): Promise<void> {
    for (const database of this.databases) {
      await database.open();
    }
  }

  /**
   * Abre as conexões.
   */
  public async close(): Promise<void> {
    for (const database of this.databases) {
      await database.close();
    }
  }
}
