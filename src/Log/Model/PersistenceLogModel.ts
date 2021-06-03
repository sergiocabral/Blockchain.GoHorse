import {IModel} from "../../Core/IModel";
import {ElasticsearchLogModel} from "./ElasticsearchLogModel";
import {ConsoleLogModel} from "./ConsoleLogModel";
import {LogLevel} from "../LogLevel";

/**
 * Modelo com os tipos de persistência de log
 */
export class PersistenceLogModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.minimumLevel = data?.minimumLevel
            ? LogLevel[data?.minimumLevel ?? ''] as any
            : null;
        this.console = new ConsoleLogModel(data?.console);
        this.elasticsearch = new ElasticsearchLogModel(data?.elasticsearch);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.minimumLevel !== null &&
            this.console.isFilled() &&
            this.elasticsearch.isFilled()
        );
    }

    /**
     * Nível de log.
     */
    public minimumLevel: LogLevel;

    /**
     * Log para console.
     */
    public console: ConsoleLogModel;

    /**
     * Log para elasticsearch
     */
    public elasticsearch: ElasticsearchLogModel;
}
