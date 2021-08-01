import {IModel} from "../../Core/IModel";

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
        this.name = (data && data["display-name"]) ?? '';
        this.isSubscriber = (data && data["subscriber"]) ?? null;

        if (this.id !== null) this.id = Number(this.id);
        if (this.isSubscriber !== null) this.isSubscriber = Boolean(this.isSubscriber);
    }

    /**
     * Cria um modelo para um usuário da Twitch.
     * @param twitchName Twitch nome
     */
    public static createTwitchUser(twitchName?: string): UserModel {
        return new UserModel({ "display-name": twitchName });
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Number.isFinite(this.id) &&
            Boolean(this.name) &&
            this.isSubscriber !== null
        );
    }

    /**
     * Id do usuário
     */
    public id: number;

    /**
     * Nome de usuário.
     */
    public name: string;

    /**
     * Indica se é inscrito.
     */
    public isSubscriber: boolean;
}
