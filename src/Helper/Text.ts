/**
 * Utilitários para manipulação e geração de string.
 */
export class Text {
    /**
     * Substitui variáveis na string por seus respectivos valores.
     * @param text Texto original
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @returns Texto com variáveis substituidas por valores.
     */
    public static querystring(text: string, values: any = { }): string {
        let result = text;
        if (Array.isArray(values)) {
            for (let i = 0; i < values.length; i++) {
                result = Text.replaceAll(result, `{${i}}`, String(values[i]));
            }
        } else if (typeof(values) === "object") {
            for (const value in values) {
                if (values.hasOwnProperty(value)) {
                    result = Text.replaceAll(result, `{${value}}`, String(values[value]));
                }
            }
        } else {
            result = Text.replaceAll(result, `{0}`, String(values));
        }
        return result;
    }

    /**
     * Substitui todas as ocorrências de uma string.
     * @param value Valor.
     * @param search String procurada.
     * @param replacement String de substituição.
     */
    public static replaceAll(value: string, search: string, replacement: string): string {
        return value.replace(new RegExp(Text.escapeRegExp(search), 'g'), replacement);
    };

    /**
     * Escapa uma string para ser usada como literal numa expressão regular.
     * @param value Valor.
     */
    public static escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
}
