import {IModel} from "../../Core/IModel";
import {LogLevel} from "../LogLevel";

/**
 * Modelo com os informações de log para elasticsearch.
 */
export class ElasticsearchLogModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.minimumLevel = data?.minimumLevel
            ? LogLevel[data?.minimumLevel ?? ''] as any
            : null;
        this.index = data?.index ?? '';
        this.url = data?.url ?? '';
        this.username = data?.username ?? '';
        this.password = data?.password ?? '';
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.minimumLevel !== null &&
            Boolean(this.index) &&
            Boolean(this.url) &&
            Boolean(this.username) &&
            Boolean(this.password)
        );
    }

    /**
     * Nível de log.
     */
    public minimumLevel: LogLevel;

    /**
     * Nome do Index.
     */
    public index: string;

    /**
     * Servidor
     */
    public url: string;

    /**
     * Usuário.
     */
    public username: string;

    /**
     * Senha.
     */
    public password: string;
}
