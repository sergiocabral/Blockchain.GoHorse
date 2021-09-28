import { WebSocketClosed } from "../../Message/WebSocketClosed";
import { WebSocketClient } from "../WebSocketClient";

/**
 * Websocket client finalizou a conexão.
 */
export class WebSocketClientClosed extends WebSocketClosed<WebSocketClient> {}
