import {IModel} from "../../Data/IModel";

/**
 * Modelo com os dados de autenticação do elasticsearch.
 */
export class LogElasticsearchModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
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
            Boolean(this.index) &&
            Boolean(this.url) &&
            Boolean(this.username) &&
            Boolean(this.password)
        );
    }

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
