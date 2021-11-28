/**
 * Resultados de uma operação de BusDatabase.
 */
export enum BusDatabaseResult {
  /**
   * Estado inicial.
   */
  None = "None",

  /**
   * Sucesso
   */
  Success = "Success",

  /**
   * Ninguém recebeu a mensagem.
   */
  Undelivered = "Undelivered",

  /**
   * Já tratado por outras instância.
   */
  AlreadyHandled = "AlreadyHandled",
}
