import {IModel} from "../../Core/IModel";
import {LogLevel} from "../LogLevel";

/**
 * Modelo com os informações de log para console.
 */
export class LogConsoleModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.minimumLevel = data?.minimumLevel
            ? LogLevel[data?.minimumLevel ?? ''] as any
            : null;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.minimumLevel !== null
        );
    }

    /**
     * Nível de log.
     */
    public minimumLevel: LogLevel;
}
