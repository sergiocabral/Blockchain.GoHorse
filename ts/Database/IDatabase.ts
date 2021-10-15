/**
 * Interface para um banco de dados usado pelo sistema.
 */
export interface IDatabase {
  /**
   * Evento: quando uma mensagem é recebida via inscrição.
   */
  get onMessage(): Set<(channel: string, message: string) => void>;

  /**
   * Sinaliza se a conexão foi iniciada.
   */
  get opened(): boolean;

  /**
   * Adiciona um valor numa tabela de dados.
   * @param table Nome da tabela.
   * @param key Chave.
   * @param values Valores.
   */
  addValues(table: string, key: string, values: unknown[]): Promise<void>;

  /**
   * Fechar conexão.
   */
  close(): Promise<void>;

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
  getValues(table: string, keys?: string[]): Promise<string[]>;

  /**
   * Envia uma notificação
   * @param channel Canal.
   * @param message Mensagem.
   */
  notify(channel: string, message: string): Promise<void>;

  /**
   * Abrir conexão.
   */
  open(): Promise<void>;

  /**
   * Remove um valor presente em uma tabela de dados.
   * @param table Nome da tabela.
   * @param keys Chave. Não informado aplica-se a todos.
   * @param values Valor. Não informado aplica-se a todos.
   */
  removeValues(
    table: string,
    keys?: string[],
    values?: unknown[]
  ): Promise<void>;

  /**
   * Se inscreve para receber notificações em um canal.
   * @param channel Canal.
   */
  subscribe(channel: string): Promise<void>;

  /**
   * Cancela a inscrição para receber notificações em um canal.
   * @param channel Canal.
   */
  unsubscribe(channel: string): Promise<void>;
}
