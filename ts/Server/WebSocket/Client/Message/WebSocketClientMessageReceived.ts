import { WebSocketMessageReceived } from "../../Message/WebSocketMessageReceived";
import { WebSocketClient } from "../WebSocketClient";

/**
 * Websocket client recebeu uma mensagem.
 */
export class WebSocketClientMessageReceived extends WebSocketMessageReceived<WebSocketClient> {}
