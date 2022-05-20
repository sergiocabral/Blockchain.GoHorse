import { MessageToInstance } from './MessageToInstance';

/**
 * Finaliza outra instância.
 */
export class Kill extends MessageToInstance {
  /**
   * Tipo da mensagem.
   */
  public override type = 'Kill';

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
  //     Kill.logContext2
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
  //     Kill.logContext2
  //   );
  // }
}
