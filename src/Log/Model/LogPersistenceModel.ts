import {IModel} from "../../Core/IModel";
import {LogElasticsearchModel} from "./LogElasticsearchModel";
import {LogConsoleModel} from "./LogConsoleModel";
import {LogLevel} from "../LogLevel";

/**
 * Modelo com os tipos de persistência de log
 */
export class LogPersistenceModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.minimumLevel = data?.minimumLevel
            ? LogLevel[data?.minimumLevel ?? ''] as any
            : null;
        this.console = new LogConsoleModel(data?.console);
        this.elasticsearch = new LogElasticsearchModel(data?.elasticsearch);
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
    public console: LogConsoleModel;

    /**
     * Log para elasticsearch
     */
    public elasticsearch: LogElasticsearchModel;
}
