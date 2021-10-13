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
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param values Valores.
   */
  public abstract addValues(
    table: string,
    key: string,
    values: string[]
  ): Promise<void>;

  /**
   * Fechar conexão.
   */
  public abstract close(): Promise<void>;

  /**
   * Retorna a lista de chaves presentes em uma tabela de dados.
   * @param table Nome da tabela.
   */
  public abstract getKeys(table: string): Promise<string[]>;

  /**
   * Retorna os valores presentes em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   */
  public abstract getValues(table: string, keys?: unknown[]): Promise<string[]>;

  /**
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   * @param values Valor. Não informado aplica-se a todos.
   */
  public abstract removeValues(
    table: string,
    keys?: string[],
    values?: unknown[]
  ): Promise<void>;
}
