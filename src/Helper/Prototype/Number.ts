import {NumericFormat} from "../NumericFormat";
import {Numeric} from "../Numeric";

declare global {
    /**
     * Interface para extender propriedades de Number.
     */
    interface Number {
        /**
         * Formata a exibição de um número.
         * @param format Opcional. Configurações de formatação.
         * @returns Número formatado como texto.
         */
        format(format?: NumericFormat): string;
    }
}

Number.prototype.format = function(format?: NumericFormat): string {
    return Numeric.format(Number(this), format);
};

export { }
