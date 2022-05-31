import { ILogWriter, LogLevel } from '@sergiocabral/helper';
import { LogToDatabaseJsonConfiguration } from './LogToDatabaseJsonConfiguration';
import { ApplicationLoggerToStream } from '@gohorse/npm-log';
import { IInstanceParameters } from '@gohorse/npm-core';
import { IDatabaseJson } from '../../Database/IDatabaseJson';

export class LogToDatabaseJson extends ApplicationLoggerToStream<
  ILogWriter,
  LogToDatabaseJsonConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToDatabaseJson';

  /**
   * Construtor.
   * @param getConfiguration – Configurações do log writer que será criado
   * @param getInstanceParameters – Parâmetros da instância em execução
   * @param database Conexão com banco de dados.
   */
  public constructor(
    getConfiguration: () => LogToDatabaseJsonConfiguration,
    getInstanceParameters: () => IInstanceParameters,
    private readonly database: IDatabaseJson
  ) {
    super(getConfiguration, getInstanceParameters);
  }

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToDatabaseJson.logContext;
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
        // TODO: Implementar LogToDatabaseJson.createInstance
      }
    };
  }

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instância em execução.
   */
  protected override configureInstance(
    configuration: LogToDatabaseJsonConfiguration,
    instanceParameters: IInstanceParameters
  ): void {
    void configuration;
    void instanceParameters;
    // TODO: Implementar LogToDatabaseJson.configureInstance
  }
}
