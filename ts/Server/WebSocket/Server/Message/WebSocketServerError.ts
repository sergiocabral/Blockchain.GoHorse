import { WebSocketError } from "../../Message/WebSocketError";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server teve um erro.
 */
export class WebSocketServerError extends WebSocketError<WebSocketServerConnection> {}
