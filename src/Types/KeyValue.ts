/**
 * Par de chave e valor através de índice.
 */
export type KeyValue<T = string> = {

    /**
     * Assinatura Index.
     */
    [index: string]: T
}
