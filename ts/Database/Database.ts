import { ConnectionState } from '@gohorse/npm-core';
import { JsonLoader } from '@sergiocabral/helper';

import { IDatabase } from './IDatabase';
import { IValue } from '../Types/IValue';
import { ValueContent } from '../Types/ValueContent';
import { ValueId } from '../Types/ValueId';

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
   * Evento: quando uma mensagem é recebida via inscrição.
   */
  public abstract get onMessage(): Set<
    (channel: string, message: string) => void
  >;

  /**
   * Estado da conexão.
   */
  public abstract get state(): ConnectionState;

  /**
   * Adiciona como histórico baseado em data um valor associado a uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param value Valor.
   */
  public abstract addHistory(
    table: string,
    key: string,
    value: ValueContent
  ): Promise<void>;

  /**
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param values Valores.
   */
  public abstract addValues(
    table: string,
    key: string,
    values: IValue[]
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
  public abstract getValues(table: string, keys?: unknown[]): Promise<IValue[]>;

  /**
   * Tenta fazer um bloqueio
   * @param table Nome da tabela.
   * @param key Identificador do lock.
   * @param content Conteúdo.
   * @param mode Ação.
   */
  public abstract lock(
    table: string,
    key: string,
    content: string,
    mode: boolean
  ): Promise<boolean>;

  /**
   * Envia uma notificação
   * @param channel Canal.
   * @param message Mensagem.
   */
  public abstract notify(channel: string, message?: string): Promise<void>;

  /**
   * Abrir conexão.
   */
  public abstract open(): Promise<void>;

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   * @param valuesIds Identificadores dos valores. Não informado aplica-se a todos.
   */
  public abstract removeValues(
    table: string,
    keys?: string[],
    valuesIds?: ValueId[]
  ): Promise<void>;

  /**
   * Se inscreve para receber notificações em um canal.
   * @param channel Canal.
   */
  public abstract subscribe(channel: string): Promise<void>;

  /**
   * Data e hora do servidor.
   */
  public abstract time(): Promise<Date>;

  /**
   * Sinaliza que a informação ainda está em uso.
   * @param table Nome da tabela.
   * @param keys Chaves. Não informado aplica-se a todos.
   */
  public abstract touch(table: string, keys?: string[]): Promise<void>;

  /**
   * Cancela a inscrição para receber notificações em um canal.
   * @param channel Canal.
   */
  public abstract unsubscribe(channel: string): Promise<void>;
}
