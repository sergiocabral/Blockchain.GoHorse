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
        this.raw = message.values ? JSON.stringify(message.values, undefined, 2) : undefined;
        Object.assign(this, this.extractFields());

        if (this.raw === undefined) delete this.raw;
    }

    /**
     * Expressão regular para capturar as propriedades de um JSON formatados (global).
     * @private
     */
    private readonly regexPropertiesG: RegExp = /^\s*"([\w-]{2,})":\s("?)([^{\[].*?)\2\W?$/mg;

    /**
     * Expressão regular para capturar as propriedades de um JSON formatados.
     * @private
     */
    private readonly regexProperties: RegExp = /^\s*"([\w-]{2,})":\s("?)([^{\[].*?)\2\W?$/m;

    /**
     * Expressão regular para capturar os nomes de canais IRC.
     * @private
     */
    private readonly regexChannelNames: RegExp = /"(#[a-z0-9_]+)"/m;

    /**
     * Preencher a instância com campos extras.
     * @private
     */
    private extractFields(): any {
        if (!this.raw) return;

        const globalMatches = this.raw.match(this.regexPropertiesG);
        if (globalMatches === null) return;

        const result: any = { };

        const channel = this.raw.match(this.regexChannelNames);
        if (channel) result['channel'] = channel[1];

        for (const globalMatch of globalMatches) {
            const match = globalMatch.match(this.regexProperties);
            if (match === null) continue;

            result[match[1]] = ElasticsearchLogMessage.fornatData(match[3]);
        }

        if (result.id !== undefined) {
            const id = result.id;
            delete result.id;
            result.id_ = id;
        }

        return result;
    }

    /**
     * Formata o dado no tipo correto.
     * @param data Dado.
     * @private
     */
    private static fornatData(data: any): any {
        const text = String(data);
        if (text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') return null;
        else if (Number.isInteger(text)) return Number(text);
        else return text;
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
    raw?: string;
}
