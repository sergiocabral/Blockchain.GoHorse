import {IModel} from "../../IModel";

export class UserOnChatModel implements IModel {
    /**
     * Construtor.
     * @param userName Usuário.
     */
    public constructor(public userName: string) {
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            Boolean(this.userName)
        );
    }

    /**
     * Contagem de mensagens enviadas.
     */
    public messageCount: number = 0;

    /**
     * Sinaliza que o usuário está na sala de chat.
     */
    public joined: boolean = false;
}
