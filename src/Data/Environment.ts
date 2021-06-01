import {ChatBoxAuthentication} from "../Twitch/Model/ChatBoxAuthentication";
import {IModel} from "./IModel";

/**
 * Dados de configuração do ambiente.
 */
export class Environment implements IModel {

    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.chatBoxAuthentication = new ChatBoxAuthentication(environment?.chatBoxAuthentication);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return this.chatBoxAuthentication.isFilled();
    }

    /**
     * Modelo com os dados de autenticação do chatbox na Twitch.
     */
    public chatBoxAuthentication: ChatBoxAuthentication;
}
