import { ILogWriter, LogLevel } from '@sergiocabral/helper';
import { ApplicationLoggerToStream } from '@gohorse/npm-log';
import { IInstanceParameters } from '@gohorse/npm-core';
import { LogToDatabaseSqlConfiguration } from './LogToDatabaseSqlConfiguration';
import { IDatabaseSql } from '../../Database/IDatabaseSql';

export class LogToDatabaseSql extends ApplicationLoggerToStream<
  ILogWriter,
  LogToDatabaseSqlConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToDatabaseSql';

  /**
   * Construtor.
   * @param getConfiguration – Configurações do log writer que será criado
   * @param getInstanceParameters – Parâmetros da instância em execução
   * @param database Conexão com banco de dados.
   */
  public constructor(
    getConfiguration: () => LogToDatabaseSqlConfiguration,
    getInstanceParameters: () => IInstanceParameters,
    private readonly database: IDatabaseSql
  ) {
    super(getConfiguration, getInstanceParameters);
  }

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToDatabaseSql.logContext;
  }

  /**
   * Cria a instância do logger.
   */
  protected override createInstance(): ILogWriter {
    return {
      defaultLogLevel: LogLevel.Debug,
      defaultValues: {},
      enabled: false,
      minimumLevel: LogLevel.Verbose,
      post(): void {
        // TODO: Implementar LogToDatabaseSql.createInstance
      }
    };
  }

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instância em execução.
   */
  protected override configureInstance(
    configuration: LogToDatabaseSqlConfiguration,
    instanceParameters: IInstanceParameters
  ): void {
    void configuration;
    void instanceParameters;
    // TODO: Implementar LogToDatabaseSql.configureInstance
  }
}
