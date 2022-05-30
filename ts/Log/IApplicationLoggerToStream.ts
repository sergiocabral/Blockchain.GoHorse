import { ILogWriter } from '@sergiocabral/helper';

/**
 * Representa um logger da instância em execução para determinada fluxo de mensagens de log.
 */
export interface IApplicationLoggerToStream<
  TLogWriter extends ILogWriter = ILogWriter
> {
  /**
   * Tipo (nome) do fluxo.
   */
  get type(): string;

  /**
   * Instância do logger.
   */
  get instance(): TLogWriter;

  /**
   * Cria e configura o logger.
   */
  create(): this;

  /**
   * Reconfigura o logger
   */
  configure(): this;
}
