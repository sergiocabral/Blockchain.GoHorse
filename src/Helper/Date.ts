import {DateTimeFormat} from "./DateTimeFormat";

/**
 * Utilitários para data e hora.
 */
export class DateTime {
    /**
     * Formata a exibição de uma data.
     * @param value Valor.
     * @param format Configurações de formatação.
     * @returns Data formatada como texto.
     */
    public static format(value: Date, format?: DateTimeFormat): string {
        const formatFullFill = DateTimeFormat.get(format);

        switch (formatFullFill.mask) {
            case "running": formatFullFill.mask = "D h:m:s"; break;
        }

        const y = value.getFullYear().toString();
        const M = (value.getMonth() + 1).toString().padStart(2, '0');
        const d = value.getDate().toString().padStart(2, '0');
        const h = value.getHours().toString().padStart(2, '0');
        const m = value.getMinutes().toString().padStart(2, '0');
        const s = value.getSeconds().toString().padStart(2, '0');
        const z = value.getMilliseconds().toString().padStart(3, '0');
        let D = 0;
        let labelD = "";
        if ((formatFullFill.mask as string).indexOf("D") >= 0) {
            D = (new Date(y + "-" + M + "-" + d).getTime() - new Date("1970-01-01").getTime()) / 1000 / 60 / 60 / 24;
            if (D === 0) labelD = "";
            else if (Math.abs(D) === 1) { labelD = formatFullFill.day as string; }
            else { labelD = formatFullFill.days as string; }
        }

        return (formatFullFill.mask as string)
            .replaceAll("y", y)
            .replaceAll("M", M)
            .replaceAll("d", d)
            .replaceAll("h", h)
            .replaceAll("m", m)
            .replaceAll("s", s)
            .replaceAll("z", z)
            .replaceAll("D", D === 0 ? "" : D + " " + labelD)
            .trim();
    }
}
