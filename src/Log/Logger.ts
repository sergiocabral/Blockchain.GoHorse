import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";
import {ElasticsearchLogger} from "./ElasticsearchLogger";
import {ConsoleLogger} from "./ConsoleLogger";

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
     * Inicializa as informações comuns do Logger global.
     * @param applicationName Nome da aplicação.
     * @param minimumLevel Nível mínimo de log para exibição
     */
    public static initialize(applicationName: string, minimumLevel: LogLevel): void {
        this.applicationName = applicationName;
        this.minimumLevel = minimumLevel;
        ConsoleLogger.minimumLevel = minimumLevel;
    }

    /**
     * Nome da aplicação.
     */
    public static applicationName: string = 'Logger';

    /**
     * Nível mínimo de log para exibição.
     */
    public static minimumLevel: LogLevel = LogLevel.Verbose;

    /**
     * Registra uma mensagem de log
     * @param text Função que monta o texto.
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @param level Nível do log.
     * @param origin Origem do log.
     */
    public static post(text: string | (() => string), values: any = undefined, level: LogLevel = LogLevel.Debug, origin: any = ''): void {
        if (level < this.minimumLevel) return;

        origin = origin !== '' ? Text.getObjectName(origin) : origin;

        if (typeof(text) === 'function') {
            text = text();
        }
        text = String(text).translate();

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
        ConsoleLogger.write(message);
    }

    /**
     * Manipula e registra mensagens de log no Elasticsearch.
     * @private
     */
    private static elasticsearchLogger: ElasticsearchLogger | null = null;

    /**
     * Escreve a mensagem no Elasticsearch
     * @param message Mensagem.
     */
    private static writeToElasticsearch(message: LogMessage): void {
        this.elasticsearchLogger = this.elasticsearchLogger || new ElasticsearchLogger();
        this.elasticsearchLogger.write(message);
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
        const message = text.querystring(values);

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
