import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";
import {LoggerElasticsearch} from "./LoggerElasticsearch";
import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";

/**
 * Registra log no console.
 */
export class LoggerConsole {
    /**
     * Nível mínimo de log para exibição.
     */
    public static minimumLevel: LogLevel = LogLevel.Verbose;

    /**
     * Escreve a mensagem no console.
     * @param message Mensagem.²³¹
     */
    public static write(message: LogMessage): void {
        if (message.level < this.minimumLevel) return;

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
}
