import {LogLevel} from "./LogLevel";
import {LogMessage} from "./LogMessage";
import {Client} from "@elastic/elasticsearch";
import {PersistenceState} from "../Types/PersistenceState";
import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";
import {LogElasticsearchModel} from "./Model/LogElasticsearchModel";
import {LogElasticsearchMessage} from "./LogElasticsearchMessage";
import {Text} from "../Helper/Text";

/**
 * Manipula e registra mensagens de log no Elasticsearch.
 */
export class LoggerElasticsearch {
    /**
     * Construtor.
     * @param minLevel Nível mínimo de log para exibição
     */
    constructor(
        public minLevel: LogLevel = LogLevel.Information) {
    }

    /**
     * Identificador da instância.
     * @private
     */
    private instanceId: string = Text.random();

    /**
     * Estado da conexão.
     * @private
     */
    private state: PersistenceState = PersistenceState.NotConnected;

    /**
     * Fila de mensagens pendentes
     * @private
     */
    private queue: LogMessage[] = [];

    /**
     * Cliente para Elasticsearch.
     * @private
     */
    private client: Client | null = null;

    /**
     * Dados de conexão com o elasticsearch.
     * @private
     */
    private options: LogElasticsearchModel | null = null;

    /**
     * Escreve a mensagem no Elasticsearch
     * @param message Mensagem.
     */
    public async write(message: LogMessage): Promise<void> {
        if (this.state === PersistenceState.Disabled) return;

        this.queue.push(message);

        if (this.state !== PersistenceState.Connected) {
            this.createClient();
            return;
        }

        if (
            this.state === PersistenceState.Connected &&
            this.client !== null &&
            this.options !== null
        ) {
            while (this.queue.length) {
                const logMessage = this.queue.shift();
                if (logMessage === undefined) continue;

                const logElasticsearchMessage = new LogElasticsearchMessage(logMessage);
                const id = logElasticsearchMessage.id;
                delete logElasticsearchMessage.id;

                await this.client.index({
                    index: this.options.index,
                    id: id,
                    body: Object.assign(logElasticsearchMessage, {
                        instanceId: this.instanceId
                    })
                });
            }
        }
    }

    /**
     * Cria o client com o Elasticsearch.
     * @private
     */
    private createClient(): void {
        if (this.state === PersistenceState.Disabled ||
            this.state !== PersistenceState.NotConnected) return;

        this.state = PersistenceState.Connecting;

        this.options = new EnvironmentQuery().request().message.environment.log.elasticsearch;

        if (!this.options.isFilled()) {
            this.state = PersistenceState.Disabled;
            this.queue.length = 0;
        } else {
            this.client = new Client({
                node: this.options.url,
                auth: {
                    username: this.options.username,
                    password: this.options.password
                }
            });
            this.state = PersistenceState.Connected;
        }
    }
}
