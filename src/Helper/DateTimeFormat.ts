/**
 * Configurações de formatação de data.
 */
export class DateTimeFormat {
    /**
     * Define os valores padrão para a formatação.
     * @param format Object com formatação.
     */
    public static defaults(format: any): void {
        if (!format) return;
        if (format.mask) DateTimeFormat.mask = format.mask;
        if (format.day) DateTimeFormat.day = format.day;
        if (format.days) DateTimeFormat.days = format.days;
        if (format.utc) DateTimeFormat.useUTC = format.utc;
    }

    /**
     * Monta o conjunto de formatação.
     * @param format Configurações de formatação.
     * @returns Conjunto de formatação totalmente preechido.
     */
    public static get(format?: DateTimeFormat): DateTimeFormat {
        return Object.assign({ }, new DateTimeFormat(), format) as DateTimeFormat;
    }

    /**
     * Máscara de formatação.
     *
     * Use para compor a máscara:
     *   D = dias corridos
     *   d = dia
     *   M = mês
     *   y = ano
     *   h = hora
     *   m = minuto
     *   s = segundo
     *   z = milissegundo
     *
     * Nomes de máscara:
     *   running = D h:m:s
     */
    public mask?: string = DateTimeFormat.mask;

    /**
     * Valor padrão para mask.
     */
    public static mask: string = "d/M/y h:m:s";

    /**
     * Texto usado para contabilizar 1 dia (singular).
     */
    public day?: string = DateTimeFormat.day;

    /**
     * Valor padrão para day.
     */
    public static day: string = "dia";

    /**
     * Texto usado para contabilizar 2 ou mais dias (plural).
     */
    public days?: string = DateTimeFormat.days;

    /**
     * Valor padrão para days.
     */
    public static days: string = "dias";

    /**
     * Exibe sem timezone.
     */
    public useUTC?: boolean = DateTimeFormat.useUTC;

    /**
     * Valor padrão para utc.
     */
    public static useUTC: boolean = false;
}
