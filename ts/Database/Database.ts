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
   * Fechar conexão.
   */
  public abstract close(): Promise<void>;

  /**
   * Apaga uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   */
  public abstract del(tableName: string, id: string): Promise<void>;

  /**
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;

  /**
   * Grava uma entrada na tabela.
   * @param tableName Nome da tabela.
   * @param id Identificador.
   * @param value Valor.
   */
  public abstract set(
    tableName: string,
    id: string,
    value: unknown
  ): Promise<void>;

  /**
   * Retorna um identificador baseado no momento atual.
   */
  public abstract timeId(): Promise<string>;
}
