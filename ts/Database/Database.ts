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
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;
}
