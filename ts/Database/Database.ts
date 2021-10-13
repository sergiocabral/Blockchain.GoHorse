import { JsonLoader } from "@sergiocabral/helper";

import { IDatabase } from "./IDatabase";

/**
 * Classe base para banco de dados.
 */
export abstract class Database<TConfiguration extends JsonLoader>
  implements IDatabase
{
  /**
   * Construtor.
   * @param configuration Configuração.
   */
  public constructor(protected readonly configuration: TConfiguration) {}

  /**
   * Sinaliza se a conexão foi iniciada.
   */
  public abstract get opened(): boolean;
  /**
   * Grava uma entrada em uma tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   * @param value Valor.
   */
  public abstract addEntry(
    tableName: string,
    id: string,
    value: unknown
  ): Promise<void>;

  /**
   * Fechar conexão.
   */
  public abstract close(): Promise<void>;

  /**
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;

  /**
   * Apaga uma entrada de uma tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   */
  public abstract removeEntry(tableName: string, id: string): Promise<void>;
}
