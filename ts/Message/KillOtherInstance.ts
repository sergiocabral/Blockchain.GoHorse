import { MessageBetweenInstances } from './MessageBetweenInstances';

/**
 * Finaliza outra instância.
 */
export class KillOtherInstance extends MessageBetweenInstances {
  /**
   * Contexto do log.
   */
  private static logContext = 'KillOtherInstance';

  // // TODO: Essa era a lógica original. Voltar ela pra algum lugar
  //
  // try {
  //   fs.unlinkSync(this.instanceFile);
  //
  //   Logger.post(
  //     'Terminated instance "{instanceId}" by deleting execution signal file: {instanceFile}',
  //     {
  //       instanceId: this.instanceId,
  //       instanceFile: this.instanceFile
  //     },
  //     LogLevel.Information,
  //     KillOtherInstance.logContext2
  //   );
  // } catch (error) {
  //   Logger.post(
  //     'Error to terminate instance "{instanceId}" by deleting execution signal file: {instanceFile}. ERROR: {error}',
  //     {
  //       instanceId: this.instanceId,
  //       instanceFile: this.instanceFile,
  //       error
  //     },
  //     LogLevel.Error,
  //     KillOtherInstance.logContext2
  //   );
  // }
}
