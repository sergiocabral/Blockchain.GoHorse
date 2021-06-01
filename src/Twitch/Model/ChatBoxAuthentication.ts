import {IModel} from "../../Data/IModel";

/**
 * Modelo com os dados de autenticação do chatbox na Twitch.
 */
export class ChatBoxAuthentication implements IModel {

    /**
     * Construtor.
     * @param data JSON para preencher o modelo.
     */
    public constructor(data: any) {
        this.username = data?.username ?? '';
        this.token = data?.token ?? '';
        this.channel = data?.channel ?? '';
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.username) &&
            Boolean(this.token) &&
            Boolean(this.channel)
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

    /**
     * Canal onde o BOT será moderador.
     */
    public channel: string;
}
