export abstract class MessageBetweenInstances {
  /**
   * Contexto do log.
   */
  private static logContext = 'MessageBetweenInstances';

  /**
   * Construtor.
   * @param instanceId Id da instância.
   * @param instanceFile Arquivo de comunicação com a instância.
   */
  constructor(
    public readonly instanceId: string,
    public readonly instanceFile: string
  ) {}

  /**
   * Envia a mensagem.
   */
  public abstract send(): Promise<void> | void;
}
