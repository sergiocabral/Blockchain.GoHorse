import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";

/**
 * Mensagem de log para Elasticsearch.
 */
export class ElasticsearchLogMessage {
    /**
     * Construtor.
     * @param message Mensagem de log.
     */
    constructor(message: LogMessage) {
        this.id = `${Text.random()}-${message.id}`;
        this.timestamp = message.time;
        this.level = LogLevel[message.level];
        this.origin = message.origin;
        this.message = message.message;
        this.messageTemplate = message.messageTemplate;
        this.values = JSON.stringify(message.values, undefined, 2);
    }

    /**
     * Identificador.
     */
    public id?: string;

    /**
     * Momento do log.
     */
    public timestamp: Date;

    /**
     * Nível do log.
     */
    public level: string;

    /**
     * Orígem do log.
     */
    public origin: string;

    /**
     * Texto.
     */
    public message: string;

    /**
     * Texto.
     */
    public messageTemplate: string;

    /**
     * Valores associados.
     */
    values: any;
}
