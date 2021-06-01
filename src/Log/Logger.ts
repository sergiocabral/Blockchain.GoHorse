import {Level} from "./Level";
import {Message} from "./Message";
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
    public static minLevel: Level = Level.Verbose;

    /**
     * Registra uma mensagem de log
     * @param text Função que monta o texto.
     * @param values Opcional. Conjunto de valores para substituição na string.
     * @param level Nível do log.
     * @param origin Origem do log.
     */
    public static post(text: string | (() => string), values: any, level: Level = Level.Debug, origin: any = ''): void {
        if (level < this.minLevel) return;
        if (typeof(origin) !== 'string') {
            origin = origin.constructor.name;
        }

        if (typeof(text) === 'function') {
            text = text();
        }

        text = Text.querystring(text, values);

        const message = this.factoryMessage(text, level, origin);
        Logger.write(message, level);
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
    private static factoryMessage(text: string, level: Level, origin: string): Message {
        return {
            id: ++Logger.messageCount,
            time: new Date(),
            level: level,
            text: text,
            origin: origin
        };
    }

    /**
     * Escreve a mensagem no console.
     * @param message Mensagem.
     * @param level Nível.
     */
    private static write(message: Message, level: Level): void {
        const text = `${message.time.toLocaleString()} [${Level[message.level] + (message.origin ? ": " + message.origin : "")}] ${message.text}`;

        let log;
        switch (level) {
            case Level.Error:               log = console.error; break;
            case Level.Warning:             log = console.warn; break;
            case Level.Information:         log = console.info; break;
            case Level.Debug:               log = console.log; break;
            default:                        log = console.debug; break;
        }

        log(text);
    }
}
