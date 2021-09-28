import { WebSocketClosed } from "../../Message/WebSocketClosed";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server finalizou a conexão.
 */
export class WebSocketServerClosed extends WebSocketClosed<WebSocketServerConnection> {}
