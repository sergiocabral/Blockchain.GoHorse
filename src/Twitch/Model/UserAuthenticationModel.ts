import {IModel} from "../../Core/IModel";

/**
 * Modelo com os dados de autenticação do usuário na Twitch.
 */
export class UserAuthenticationModel implements IModel {
    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.username = data?.username ?? '';
        this.token = data?.token ?? '';
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.username) &&
            Boolean(this.token)
        );
    }

    /**
     * Nome de usuário autor das mensagens do BOT.
     */
    public username: string;

    /**
     * Token de autenticação para o usuário autor das mensagens do BOT.
     */
    public token: string;
}
