/**
 * Motivos para uma mensagem do usuário ser devolvida.
 */
export enum RejectReason {
  /**
   * Comando inválido.
   */
  Invalid = "invalid",

  /**
   * Não houve receptor do comando. Tente mais tarde.
   */
  Undelivered = "undelivered",
}
