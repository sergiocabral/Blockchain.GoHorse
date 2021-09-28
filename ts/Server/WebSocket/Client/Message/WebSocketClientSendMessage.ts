import { WebSocketSendMessage } from "../../Message/WebSocketSendMessage";
import { WebSocketClient } from "../WebSocketClient";

/**
 * Enviar uma mensagem via websocket.
 */
export class WebSocketClientSendMessage extends WebSocketSendMessage<
  WebSocketClient,
  undefined
> {}
