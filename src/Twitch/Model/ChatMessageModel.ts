import {IModel} from "../../Core/IModel";
import {UserModel} from "./UserModel";
import {ChannelModel} from "./ChannelModel";
import {ChatUserstate} from "tmi.js";

/**
 * Modelo com os dados do resgate
 */
export class ChatMessageModel implements IModel {
    /**
     * Construtor.
     * @param channelName Nome do canal.
     * @param userData Dados do usuário.
     * @param message Mensage.
     * @param raw Dado original em formato bruto.
     */
    public constructor(
        channelName: string,
        userData: ChatUserstate,
        message: string,
        raw?: any) {
        this.channel = new ChannelModel(channelName);
        this.user = new UserModel(userData);
        this.message = message ?? '';
        this.raw = raw;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.channel.isFilled() &&
            this.user.isFilled() &&
            Boolean(this.message)
        );
    }

    /**
     * Canal.
     */
    public channel: ChannelModel;

    /**
     * Usuário.
     */
    public user: UserModel;

    /**
     * Mensagem associada.
     */
    public message: string;

    /**
     * Dados bruto.
     */
    public raw?: string;
}
