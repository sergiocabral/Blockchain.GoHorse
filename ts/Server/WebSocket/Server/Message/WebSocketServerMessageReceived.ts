import { WebSocketMessageReceived } from "../../Message/WebSocketMessageReceived";
import { WebSocketServerConnection } from "../WebSocketServerConnection";

/**
 * Websocket server recebeu uma mensagem.
 */
export class WebSocketServerMessageReceived extends WebSocketMessageReceived<WebSocketServerConnection> {}
