import {Text} from "../Helper/Text";

declare global {
    /**
     * Interface para extender propriedades de String.
     */
    interface String {
        /**
         * Retorna um valor randômico
         * @param length Opcional. Comprimento da string
         */
        random(length?: number): string;

        /**
         * Substitui todas as ocorrências de uma string.
         * @param search String procurada.
         * @param replacement String de substituição.
         */
        replaceAll(search: string, replacement: string): string;

        /**
         * Escapa uma string para ser usada como literal numa expressão regular.
         */
        escapeRegExp(): string;

        /**
         * Substitui variáveis na string por seus respectivos valores.
         * @param values Opcional. Conjunto de valores para substituição na string.
         */
        querystring(values: any): string;
    }
}

String.prototype.random = function(length?: number): string {
    return Text.random(String(this), length);
}

String.prototype.replaceAll = function(search: string, replacement: string): string {
    return Text.replaceAll(String(this), search, replacement);
};

String.prototype.escapeRegExp = function(): string {
    return Text.escapeRegExp(String(this));
};

String.prototype.querystring = function(values: any): string {
    return Text.querystring(String(this), values);
};

export { }
