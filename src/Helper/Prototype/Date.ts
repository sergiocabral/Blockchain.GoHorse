import {DateTimeFormat} from "../DateTimeFormat";
import {DateTime} from "../Date";

declare global {
    /**
     * Interface para extender propriedades de Date.
     */
    interface Date {
        /**
         * Formata a exibição de uma data.
         * @param format Opcional. Configurações de formatação.
         * @returns Data formatada como texto.
         */
        format(format?: DateTimeFormat): string;
    }
}

Date.prototype.format = function(format?: DateTimeFormat): string {
    return DateTime.format(this, format);
};

export { }
