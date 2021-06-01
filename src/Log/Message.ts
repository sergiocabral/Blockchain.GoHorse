import {Level} from "./Level";

/**
 * Mensagem de log.
 */
export type Message = {
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
    level: Level,

    /**
     * Orígem do log.
     */
    origin: string,

    /**
     * Texto.
     */
    text: string
}
