/**
 * Chave presente em um template.
 */
export type TemplateKey = {
    /**
     * Nome.
     */
    name: string,

    /**
     * Espaçamento no início.
     */
    padStart: number | null,

    /**
     * Espaçamento no final.
     */
    padEnd: number | null,

    /**
     * Posição no texto original.
     */
    indexOf: number,

    /**
     * Expressão completa da key assim como foi capturada.
     */
    expression: string
}
