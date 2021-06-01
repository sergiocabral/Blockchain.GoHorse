import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";

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
    public static post(text: string | (() => string), values: any, level: LogLevel = LogLevel.Debug, origin: any = ''): void {
        if (level < this.minLevel) return;
        origin = Text.getObjectName(origin);

        if (typeof(text) === 'function') {
            text = text();
        }

        text = Text.querystring(text, values);

        const message = this.factoryMessage(text, level, origin);
        Logger.write(message, level);
    }

    /**
     * Escreve a mensagem no console.
     * @param message Mensagem.
     * @param level Nível.
     */
    private static write(message: LogMessage, level: LogLevel): void {
        const text = `${message.time.toLocaleString()} [${LogLevel[message.level] + (message.origin ? ": " + message.origin : "")}] ${message.text}`;

        let log;
        switch (level) {
            case LogLevel.Error:               log = console.error; break;
            case LogLevel.Warning:             log = console.warn; break;
            case LogLevel.Information:         log = console.info; break;
            case LogLevel.Debug:               log = console.log; break;
            default:                        log = console.debug; break;
        }

        log(text);
    }

    /**
     * Contador de mensagens.
     * @private
     */
    private static messageCount: number = 0;

    /**
     * Monta um objeto de mensagem de log.
     * @param text Texto da mensagem.
     * @param level Nível da mensagem.
     * @param origin Orígem do log. Nome do módulo ou arquivo.
     */
    private static factoryMessage(text: string, level: LogLevel, origin: string): LogMessage {
        return {
            id: ++Logger.messageCount,
            time: new Date(),
            level: level,
            text: text,
            origin: origin
        };
    }
}
