import {IModel} from "../../../Core/IModel";

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

    /**
     * Tags associadas ao usuário.
     */
    public tags: string[] = [];

    /**
     * Criação
     */
    public readonly creation: Date = new Date();

    /**
     * Última atualização
     */
    public updated: Date = new Date();
}
