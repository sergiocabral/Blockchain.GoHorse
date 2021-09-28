import { WebSocketSendMessage } from "../../Message/WebSocketSendMessage";
import { WebSocketServer } from "../WebSocketServer";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server iniciou a conexão.
 */
export class WebSocketServerSendMessage extends WebSocketSendMessage<
  WebSocketServer,
  WebSocketServerConnection
> {}
