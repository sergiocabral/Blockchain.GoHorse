import { ILogWriter } from '@sergiocabral/helper';

/**
 * Representa um logger para determinada fluxo de mensagens de log.
 */
export interface ILoggerToStream<TLogWriter extends ILogWriter = ILogWriter> {
  /**
   * Tipo (nome) do fluxo.
   */
  get type(): string;

  /**
   * Instância do logger.
   */
  get instance(): TLogWriter;

  /**
   * Define um logger base para configurar esta instância.
   * Serão atribuídas à instância as referências `customFactoryMessage` e `defaultValues` do logger base.
   */
  setBaseLogger(baseLogger: ILogWriter | undefined): this;

  /**
   * Cria e configura o logger.
   */
  create(): this;

  /**
   * Reconfigura o logger
   */
  configure(): this;
}
