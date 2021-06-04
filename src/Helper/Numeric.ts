import {NumericFormat} from "./NumericFormat";

/**
 * Utilitários para manipulação de números.
 */
export class Numeric {
    /**
     * Retorna um valor randômico
     * @param length Dígitos inteiros
     * @returns Resultado.
     */
    public static random(length: number = 10): number {
        do {
            const result = Math.trunc(Math.random() * Math.pow(10, length));
            if (result.toString().length === length) return result;
        } while (true);
    }

    /**
     * Retorna um valor randômico entre dois números.
     * @param min Menor número possível.
     * @param max Maior número possível.
     * @returns Resultado.
     */
    public static between(min: number = 0, max: number = 100): number {
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
    }

    /**
     * Formata a exibição de um número.
     * @param value Valor.
     * @param format Opcional. Configurações de formatação.
     * @returns Número formatado como texto.
     */
    public static format(value: number, format?: NumericFormat): string {
        const formatFullFill = NumericFormat.get(format);

        let result: string = value.toFixed(formatFullFill.digits);
        if (formatFullFill.decimal !== '.') result = result.replace('.', formatFullFill.decimal as string);
        if (formatFullFill.miles) {
            const decimal = formatFullFill.decimal ? formatFullFill.decimal : '.';
            const integer = result.substr(0, (result + decimal).indexOf(decimal));
            const decimals = result.substr(integer.length);
            result = integer.replace(/\B(?=(\d{3})+(?!\d))/g, formatFullFill.miles) + decimals;
        }
        if (formatFullFill.showPositive && value >= 0) result = '+' + result;
        return formatFullFill.prefix + result + formatFullFill.suffix;
    }

}
