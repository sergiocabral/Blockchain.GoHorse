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
  public constructor(private readonly configuration: TConfiguration) {}

  /**
   * Fechar conexão.
   */
  public abstract close(): Promise<void>;

  /**
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;
}
