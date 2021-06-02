import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";
import {LoggerElasticsearch} from "./LoggerElasticsearch";

/**
 * Manipula e registra mensagens de log.
 */
export class Logger {
    /**
     * Construtor.
     * @private
     */
    private constructor() { }

    /**
     * Nível mínimo de log para exibição.
     */
    public static minLevel: LogLevel = LogLevel.Verbose;

    /**
     * Registra uma mensagem de log
     * @param text Função que monta o texto.
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @param level Nível do log.
     * @param origin Origem do log.
     */
    public static post(text: string | (() => string), values: any = undefined, level: LogLevel = LogLevel.Debug, origin: any = ''): void {
        if (level < this.minLevel) return;
        origin = origin !== '' ? Text.getObjectName(origin) : origin;

        if (typeof(text) === 'function') {
            text = text();
        }

        for (const value in values) {
            if (values.hasOwnProperty(value) && typeof(values[value]) === 'function') {
                values[value] = values[value]();
            }
        }

        const message = this.factoryMessage(text, values, level, origin);

        this.writeToConsole(message);
        this.writeToElasticsearch(message);
    }

    /**
     * Escreve a mensagem no console.
     * @param message Mensagem.
     */
    private static writeToConsole(message: LogMessage): void {
        const text = `${message.time.toLocaleString()} [${LogLevel[message.level] + (message.origin ? ": " + message.origin : "")}] ${message.message}`;

        let log;
        switch (message.level) {
            case LogLevel.Error:               log = console.error; break;
            case LogLevel.Warning:             log = console.warn; break;
            case LogLevel.Information:         log = console.info; break;
            case LogLevel.Debug:               log = console.log; break;
            default:                           log = console.debug; break;
        }

        log(text);
    }

    /**
     * Manipula e registra mensagens de log no Elasticsearch.
     * @private
     */
    private static loggerElasticsearch: LoggerElasticsearch | null = null;

    /**
     * Escreve a mensagem no Elasticsearch
     * @param message Mensagem.
     */
    private static writeToElasticsearch(message: LogMessage): void {
        this.loggerElasticsearch = this.loggerElasticsearch || new LoggerElasticsearch();
        this.loggerElasticsearch.write(message);
    }

    /**
     * Contador de mensagens.
     * @private
     */
    private static messageCount: number = 0;

    /**
     * Monta um objeto de mensagem de log.
     * @param text Texto da mensagem.
     * @param values Conjunto de valores relacionados.
     * @param level Nível da mensagem.
     * @param origin Orígem do log. Nome do módulo ou arquivo.
     */
    private static factoryMessage(text: string, values: any, level: LogLevel, origin: string): LogMessage {
        const message = Text.querystring(text, values);

        return {
            id: ++this.messageCount,
            time: new Date(),
            level: level,
            message: message,
            messageTemplate: text,
            origin: origin,
            values: values
        };
    }
}
