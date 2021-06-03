/**
 * Consulta de textos traduzidos.
 */
import {InvalidExecutionError} from "../Errors/InvalidExecutionError";
import {KeyValue} from "../Helper/Types/KeyValue";

export class Translate {

    /**
     * Instância padrão para uso geral do sistema.
     */
    public static default: Translate;

    /**
     * Contrutor.
     * @param language Idioma.
     * @param setDefault Opcional. Define a instância como padrão do sistema.
     */
    public constructor(public language: string, setDefault: boolean = false) {
        if (setDefault) {
            if (!Translate.default) Translate.default = this;
            else throw new InvalidExecutionError("Translate.default already defined.");
        }
    }

    /**
     * Fonte de traduções.
     */
    private readonly translates: KeyValue<KeyValue> = { };

    /**
     * Carrega traduções.
     * @param source Fonte de traduções.
     * @param language Opcional. Idioma.
     */
    public load(source: any, language: string = this.language): void {
        this.translates[language] = this.translates[language] ? this.translates[language] : { };
        const find = (destination: KeyValue, source: any) => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof(source[key]) === 'string') destination[key] = source[key];
                    else find(destination, source[key]);
                }
            }
        };
        find(this.translates[language], source);
    }

    /**
     * Retorna um texto traduzido.
     * @param text Texto.
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @param language Opcional. Idioma.
     */
    public get(text: string, values?: any, language: string = this.language): string {
        let translated = this.translates[language] && this.translates[language][text] !== undefined ?
            this.translates[language][text] : text;
        return translated.querystring(values);
    }

    /**
     * Retorna um texto traduzido.
     * @param text Texto.
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @param language Opcional. Idioma.
     */
    public static get(text: string, values?: any, language?: string): string {
        if (Translate.default) return Translate.default.get(text, values, language);
        else return text.querystring(values);
    }
}
