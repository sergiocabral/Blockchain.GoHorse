/**
 * Modos de definir a data do commit (bloco) atual
 */
export enum CommitDateMode {
    /**
     * Data corrente.
     */
    CurrentDate = 0,

    /**
     * Data do primeiro commit.
     */
    FirstBlock = 1,

    /**
     * Data do último commit.
     */
    LastBlock = 2,

    /**
     * Data do último commit incrementado de 1 tick.
     */
    LastBlockIncrement = 3
}
