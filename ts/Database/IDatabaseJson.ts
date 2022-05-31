/**
 * Representa uma conexão com o banco de dados tipo NoSQL.
 */
export interface IDatabaseJson {
  /**
   * Grava um documento.
   * @param document Documento JSON.
   */
  save(document: Record<string, unknown>): Promise<void> | void;
}
