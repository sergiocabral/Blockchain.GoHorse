import {IModel} from "../../Core/IModel";
import {LogElasticsearchModel} from "./LogElasticsearchModel";

/**
 * Modelo com os tipos de persistência de log
 */
export class LogPersistenceModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.elasticsearch = new LogElasticsearchModel(data?.elasticsearch);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.elasticsearch.isFilled()
        );
    }

    /**
     * Servidor
     */
    public elasticsearch: LogElasticsearchModel;
}
