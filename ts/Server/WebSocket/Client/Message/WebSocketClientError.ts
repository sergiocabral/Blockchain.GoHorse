import { WebSocketError } from "../../Message/WebSocketError";
import { WebSocketClient } from "../WebSocketClient";

/**
 * Websocket client teve um erro.
 */
export class WebSocketClientError extends WebSocketError<WebSocketClient> {}
