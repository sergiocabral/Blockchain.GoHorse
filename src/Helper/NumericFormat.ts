/**
 * Configurações de formatação de número.
 */
export class NumericFormat {

    /**
     * Define os valores padrão para a formatação.
     * @param format Object com formatação.
     */
    public static defaults(format: any): void {
        if (!format) return;
        if (format.digits) NumericFormat.digits = format.digits;
        if (format.decimal) NumericFormat.decimal = format.decimal;
        if (format.miles) NumericFormat.miles = format.miles;
        if (format.showPositive) NumericFormat.showPositive = format.showPositive;
        if (format.prefix) NumericFormat.prefix = format.prefix;
        if (format.suffix) NumericFormat.suffix = format.suffix;
    }

    /**
     * Monta o conjunto de formatação.
     * @param format Configurações de formatação.
     * @returns Conjunto de formatação totalmente preechido.
     */
    public static get(format?: NumericFormat): NumericFormat {
        return Object.assign({ }, new NumericFormat(), format) as NumericFormat;
    }

    /**
     * Dígitos decimais.
     */
    public digits?: number = NumericFormat.digits;

    /**
     * Valor padrão para digits.
     */
    public static digits: number = 2;

    /**
     * Caracter usado como vírgula.
     */
    public decimal?: string = NumericFormat.decimal;

    /**
     * Valor padrão para decimal.
     */
    public static decimal: string = '.';

    /**
     * Valor padrão para separador de milhares.
     */
    public miles?: string = NumericFormat.miles;

    /**
     * Valor padrão para separador de milhares.
     */
    public static miles: string = ',';

    /**
     * Exibe o sinal de positivo sempre.
     */
    public showPositive?: boolean = NumericFormat.showPositive;

    /**
     * Valor padrão para showPositive.
     */
    public static showPositive: boolean = false;

    /**
     * Texto anexado no início do resultado.
     */
    public prefix?: string = NumericFormat.prefix;

    /**
     * Valor padrão para prefix.
     */
    public static prefix: string = '';

    /**
     * Texto anexado no final do resultado.
     */
    public suffix?: string = NumericFormat.suffix;

    /**
     * Valor padrão para suffix.
     */
    public static suffix: string = '';
}
