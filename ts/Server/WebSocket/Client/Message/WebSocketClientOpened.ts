import { WebSocketOpened } from "../../Message/WebSocketOpened";
import { WebSocketClient } from "../WebSocketClient";

/**
 * Websocket client iniciou a conexão.
 */
export class WebSocketClientOpened extends WebSocketOpened<WebSocketClient> {}
