import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Text} from "../Helper/Text";
import {KeyValue} from "../Helper/Types/KeyValue";

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
        this.source =
            message.values?.source
                ? JSON.stringify(message.values.source, undefined, 2)
                : (message.values
                    ? JSON.stringify(message.values, undefined, 2)
                    : undefined
                );
        Object.assign(this, this.extractFields());

        if (this.source === undefined) delete this.source;
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
        if (!this.source) return;

        const globalMatches = this.source.match(this.regexPropertiesG);
        if (globalMatches === null) return;

        const result: any = { };

        const channel = this.source.match(this.regexChannelNames);
        if (channel) result['channel'] = channel[1];

        for (const globalMatch of globalMatches) {
            const match = globalMatch.match(this.regexProperties);
            if (match === null) continue;

            const propertyName = match[1];
            const propertyValue = match[3];
            const typedPropertyValues = ElasticsearchLogMessage.extractTypes(propertyName, propertyValue);
            for (const typedPropertyName in typedPropertyValues) {
                if (typedPropertyValues.hasOwnProperty(typedPropertyName)) {
                    result[typedPropertyName] = typedPropertyValues[typedPropertyName];
                }
            }

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
     * @private
     * @param propertyName Nome da propriedade.
     * @param propertyValue Valor original.
     */
    private static extractTypes(propertyName: string, propertyValue: any): KeyValue<any> {
        const result: KeyValue<any> = { };

        const text = String(propertyValue).trim();

        if (text === 'null' || text === 'undefined') {
            result[propertyName] = null;
            return result;
        }

        result[propertyName] = text;

        let number: number;
        if ((number = Number(text)).toString() == text) {
            result[`${propertyName}-number`] = number;
        }

        let booleanText: string;
        if ((booleanText = text.toLowerCase()) === 'false' || booleanText === 'true' || booleanText === '0' || booleanText === '1' || booleanText === '-1') {
            result[`${propertyName}-boolean`] = ['true', '1', '-1'].includes(booleanText);
        }

        return result;
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
    source?: string;
}
