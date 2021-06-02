import {IModel} from "../../Data/IModel";

/**
 * Modelo com os dados do usuário.
 */
export class UserModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.id = (data && data["user-id"]) ?? null;
        this.guid = (data && data["id"]) ?? '';
        this.name = (data && data["display-name"]) ?? '';
        this.isSubscriber = (data && data["subscriber"]) ?? null;

        if (this.id !== null) this.id = Number(this.id);
        if (this.isSubscriber !== null) this.isSubscriber = Boolean(this.isSubscriber);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Number.isFinite(this.id) &&
            Boolean(this.guid) &&
            Boolean(this.name) &&
            this.isSubscriber !== null
        );
    }

    /**
     * Id do usuário
     */
    public id: number;

    /**
     * Id do usuário (guid)
     */
    public guid: string;

    /**
     * Nome de usuário.
     */
    public name: string;

    /**
     * Indica se é inscrito.
     */
    public isSubscriber: boolean;
}
