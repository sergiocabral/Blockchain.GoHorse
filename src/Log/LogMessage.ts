import {LogLevel} from "./LogLevel";

/**
 * Mensagem de log.
 */
export type LogMessage = {
    /**
     * Identificador.
     */
    id: number,

    /**
     * Momento do log.
     */
    time: Date,

    /**
     * Nível do log.
     */
    level: LogLevel,

    /**
     * Orígem do log.
     */
    origin: string,

    /**
     * Texto.
     */
    message: string,

    /**
     * Template do texto.
     */
    messageTemplate: string,

    /**
     * Valores associados.
     */
    values: any
}
