import { Logger, Message } from "@sergiocabral/helper";

import { IApplication } from "../../Core/IApplication";
import { WebRequest } from "../../Webserver/Message/WebRequest";
import { Webserver } from "../../Webserver/Webserver";

/**
 * Barramento de mensagens para comunicação entre as aplicações.
 */
export class BusApplication implements IApplication {

  /**
   * Mensagem: WebRequestMessage
   */
  private static handleWebRequestMessage(message: WebRequest): void {
    if (message.path.includes('haha')) {
      Logger.post('catched: {0}', message.path);
    }
  }
  /**
   * Servidor web.
   */
  private webserver: Webserver;

  /**
   * Construtor.
   */
  public constructor() {
    // tslint:disable-next-line:no-magic-numbers
    this.webserver = new Webserver({port: 3000});
    Message.subscribe(WebRequest, BusApplication.handleWebRequestMessage.bind(this));
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    Logger.post(this.constructor.name);
    this.webserver.start();
  }
}
