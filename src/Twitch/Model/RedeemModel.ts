import {IModel} from "../../Core/IModel";
import {UserModel} from "./UserModel";
import {ChannelModel} from "./ChannelModel";
import {ChatUserstate} from "tmi.js";

/**
 * Modelo com os dados do resgate
 */
export class RedeemModel implements IModel {
    /**
     * Construtor.
     * @param channelName Nome do canal.
     * @param userData Dados do usuário.
     * @param redeemId Identificador da recompensa.
     * @param redeemMessage Mensage da recompensa.
     * @param raw Dado original em formato bruto.
     */
    public constructor(
        channelName: string,
        userData: ChatUserstate,
        redeemId: "highlighted-message" | "skip-subs-mode-message" | string,
        redeemMessage: string,
        raw?: any) {
        this.channel = new ChannelModel(channelName);
        this.user = new UserModel(userData);
        this.id = redeemId ?? '';
        this.message = redeemMessage ?? '';
        this.raw = raw;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.channel.isFilled() &&
            this.user.isFilled() &&
            Boolean(this.id)
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
     * Identificador da recompensa
     */
    public id: string;

    /**
     * Mensagem associada.
     */
    public message: string;

    /**
     * Dados bruto.
     */
    public raw?: string;
}
