import {
  HelperObject,
  Logger,
  LogLevel,
  LogWriterToPersistent,
  PrimitiveValueType
} from '@sergiocabral/helper';
import { LogToDatabaseConfiguration } from './LogToDatabaseConfiguration';
import { Generate, IInstanceParameters } from '@gohorse/npm-core';
import { IDatabasePushOnly } from '../../Database/IDatabasePushOnly';
import { ILogMessageAndData } from '@sergiocabral/helper/js/Log/ILogMessageAndData';
import { LoggerToStream } from '@gohorse/npm-log';

export class LogToDatabase extends LoggerToStream<
  LogWriterToPersistent,
  LogToDatabaseConfiguration
> {
  /**
   * Contexto do log.
   */
  private static logContext = 'LogToDatabase';

  /**
   * Construtor.
   * @param database Conexão com banco de dados.
   * @param getConfiguration – Configurações do log writer que será criado
   * @param getInstanceParameters – Parâmetros da instância em execução
   * @param defaultLogLevel Nível padrão de log quando não informado
   * @param waitInMillisecondsOnError waitInMillisecondsOnError – Espera em milissegundos em caso de erro.
   */
  public constructor(
    private readonly database: IDatabasePushOnly,
    getConfiguration: () => LogToDatabaseConfiguration,
    getInstanceParameters: () => IInstanceParameters,
    defaultLogLevel: LogLevel,
    private readonly waitInMillisecondsOnError?: number
  ) {
    super(getConfiguration, getInstanceParameters, defaultLogLevel);
  }

  /**
   * Tipo (nome) do fluxo.
   */
  public override get type(): string {
    return LogToDatabase.logContext;
  }

  /**
   * Cria a instância do logger.
   */
  protected override createInstance(): LogWriterToPersistent {
    return new LogWriterToPersistent(
      this.database,
      this.saveToPersistent.bind(this)
    );
  }

  /**
   * Configura a instância do logger.
   * @param configuration Configuração.
   * @param instanceParameters Parâmetros da instância em execução.
   */
  protected override configureInstance(
    configuration: LogToDatabaseConfiguration,
    instanceParameters: IInstanceParameters
  ): void {
    void instanceParameters;

    Logger.post(
      'Setting logger "{logWriterType}" waitInMillisecondsOnError: {value}.',
      {
        logWriterType: this.type,
        value: configuration.waitInMillisecondsOnError
      },
      LogLevel.Debug,
      LogToDatabase.logContext
    );
    this.instance.waitInMillisecondsOnError =
      configuration.waitInMillisecondsOnError;
  }

  /**
   * Escreve o log de fato.
   */
  private async saveToPersistent(
    messageAndData: ILogMessageAndData
  ): Promise<void> {
    await this.database.push(
      {
        id: Generate.id('l', 19),
        timestamp: messageAndData.logMessage.timestamp.toISOString(),
        messageTemplate: messageAndData.messageTemplate,
        level: messageAndData.logMessage.level,
        section: messageAndData.logMessage.section,
        message: messageAndData.logMessage.message
      },
      LogToDatabase.formatValues(messageAndData.values)
    );
  }

  /**
   * Formata um conjunto de valores para ser gravados no banco de dados como JSON.
   */
  private static formatValues(
    values: unknown
  ): Record<string, PrimitiveValueType | undefined> {
    const divisor = String.fromCharCode(0);

    // TODO: Reimplementar formatValues npm-core com um tipo de flattern

    const getValue = (value: unknown): string | undefined => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        return String(value);
      } else if (value === null || value === undefined) {
        return undefined;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (Array.isArray(value)) {
        return value.map(item => getValue(item)).join(divisor);
      } else {
        return HelperObject.toText(value, 0);
      }
    };

    if (Array.isArray(values)) {
      return values
        .map(item => getValue(item))
        .join(divisor)
        .split(divisor)
        .filter(item => item !== undefined)
        .reduce((result, item, index) => {
          result[index.toString()] = item;
          return result;
        }, {} as Record<string, PrimitiveValueType | undefined>);
    } else if (
      values !== undefined &&
      values !== null &&
      typeof values === 'object'
    ) {
      const dictionary = values as Record<
        string,
        PrimitiveValueType | undefined
      >;
      for (const key in dictionary) {
        dictionary[key] = getValue(dictionary[key]);
      }
      return dictionary;
    } else {
      const value = getValue(values);
      return value !== undefined ? { value } : {};
    }
  }
}
