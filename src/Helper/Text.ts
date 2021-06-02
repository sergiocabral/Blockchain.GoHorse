import {InvalidArgumentError} from "../Errors/InvalidArgumentError";
import {EmptyValueError} from "../Errors/EmptyValueError";
import {KeyValue} from "../Types/KeyValue";

/**
 * Utilitários para manipulação e geração de string.
 */
export class Text {
    /**
     * Armazena os valores randômicos fixos.
     */
    private static randomFixed: KeyValue = { };

    /**
     * Retorna um valor randômico
     * @param {string} generator Opcional. Quando informado gera um randômico fixo para este valor em futuras consultas.
     * @param {number} length Opcional. Comprimento da string
     */
    public static random(generator?: string, length: number = 10): string {
        if (generator && Text.randomFixed[generator]) {
            if (length != Text.randomFixed[generator].length) throw new InvalidArgumentError("Cannot change length after randomized.");
            return Text.randomFixed[generator];
        }
        let result = "";
        while (result.length < length) {
            result += Buffer
                .from(Math.random().toString())
                .toString('base64')
                .substr(5)
                .replace(/([^a-z0-9]|^[0-9]*)/gi, '');
        }
        result = result.substr(0, length);
        if (generator) Text.randomFixed[generator] = result;
        return result;
    }

    /**
     * Retorna o nome de uma instância.
     * @param instance Instância.
     * @returns Nome.
     */
    public static getObjectName(instance: any): string {
        let name;
        if (typeof(instance) === 'string') name = instance;
        else if (typeof(instance) === 'object') name = instance.constructor.name;
        else if (typeof(instance) === 'function') name = instance.name;
        else throw new InvalidArgumentError("Instance must be string, object or function. Type: " + typeof(instance));
        if (!name) throw new EmptyValueError("Name is empty. Type: " + typeof(instance));
        return name;
    }

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
