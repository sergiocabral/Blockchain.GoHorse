import { IConnection } from '@gohorse/npm-core';

import { IValue } from '../Types/IValue';
import { ValueContent } from '../Types/ValueContent';
import { ValueId } from '../Types/ValueId';

/**
 * Interface para um banco de dados usado pelo sistema.
 */
export interface IDatabase extends IConnection {
  /**
   * Evento: quando uma mensagem é recebida via inscrição.
   */
  get onMessage(): Set<(channel: string, message: string) => void>;

  /**
   * Adiciona como histórico baseado em data um valor associado a uma tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param value Valor.
   */
  addHistory(table: string, key: string, value: ValueContent): Promise<void>;

  /**
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param values Valores.
   */
  addValues(table: string, key: string, values: IValue[]): Promise<void>;

  /**
   * Retorna a lista de chaves presentes em uma tabela de dados.
   * @param table Nome da tabela.
   */
  getKeys(table: string): Promise<string[]>;

  /**
   * Retorna os valores presentes em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chaves. Não informado aplica-se a todos.
   */
  getValues(table: string, keys?: string[]): Promise<IValue[]>;

  /**
   * Tenta fazer um bloqueio
   * @param table Nome da tabela.
   * @param key Identificador do lock.
   * @param content Conteúdo.
   * @param mode Ação.
   */
  lock(
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
  notify(channel: string, message?: string): Promise<void>;

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   * @param valuesIds Identificadores dos valores. Não informado aplica-se a todos.
   */
  removeValues(
    table: string,
    keys?: string[],
    valuesIds?: ValueId[]
  ): Promise<void>;

  /**
   * Se inscreve para receber notificações em um canal.
   * @param channel Canal.
   */
  subscribe(channel: string): Promise<void>;

  /**
   * Data e hora do servidor.
   */
  time(): Promise<Date>;

  /**
   * Sinaliza que a informação ainda está em uso.
   * @param table Nome da tabela.
   * @param keys Chaves. Não informado aplica-se a todos.
   */
  touch(table: string, keys?: string[]): Promise<void>;

  /**
   * Cancela a inscrição para receber notificações em um canal.
   * @param channel Canal.
   */
  unsubscribe(channel: string): Promise<void>;
}
