import { BusMessageSender } from "../../Bus/BusMessageSender";
import { Application } from "../../Core/Application";
import { WebSocketClient } from "../../WebSocket/WebSockerClient";

import { MinerConfiguration } from "./MinerConfiguration";

/**
 * Minerador.
 */
export class MinerApplication extends Application<MinerConfiguration> {
  /**
   * Tipo da configuração;
   */
  protected readonly configurationType = MinerConfiguration;

  /**
   * Enviador de mensagem via websocket.
   */
  private readonly busMessageSender: BusMessageSender;

  /**
   * Cliente websocket.
   */
  private readonly webSocketClient: WebSocketClient;

  /**
   * Construtor.
   */
  public constructor() {
    super();
    this.webSocketClient = new WebSocketClient(
      this.configuration.messageBusWebSocketServer
    );
    this.busMessageSender = new BusMessageSender(this.webSocketClient);
  }

  /**
   * Executa a aplicação.
   */
  public run(): void {
    this.webSocketClient.start();
  }

  /**
   * Finaliza a aplicação.
   */
  public stop(): void {
    if (this.webSocketClient.started) {
      this.webSocketClient.stop();
    }
  }
}
