import { WebSocketOpened } from "../../Message/WebSocketOpened";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server iniciou a conexão.
 */
export class WebSocketServerOpened extends WebSocketOpened<WebSocketServerConnection> {}
