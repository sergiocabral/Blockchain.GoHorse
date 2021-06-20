/**
 * Modo de considerar uma mensagem como sendo a primeira
 */
export enum ReplyFirstMessageMode {
    /**
     * Primeira mensagem por canal.
     */
    PerChannel = 0,

    /**
     * Primeira mensagem não importa o canal.
     */
    Global = 1
}
