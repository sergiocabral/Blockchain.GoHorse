/**
 * Ações possíveis quando a mineração falha.
 */
export enum StaleAction {
    /**
     * Descarta a transação atual.
     */
    Discard = 0,

    /**
     * Tenta minerar novamente a trasação atual.
     */
    Retry = 1,

    /**
     * Invalida toda a fila de transações pendnetes.
     */
    Stop = 2
}
