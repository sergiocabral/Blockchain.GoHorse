export enum WebSocketEvent {
  /**
   * Conexão recebida.
   */
  Connection = "Connection",

  /**
   * Conexão encerrada.
   */
  Close = "Close",

  /**
   * Erro.
   */
  Error = "Error",

  /**
   * Mensagem recebida.
   */
  Message = "Message",
}
