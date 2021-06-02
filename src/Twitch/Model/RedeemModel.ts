import {IModel} from "../../Data/IModel";
import {UserModel} from "./UserModel";
import {ChannelModel} from "./ChannelModel";

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
     */
    public constructor(channelName: any, userData: any, redeemId: any, redeemMessage: string, raw?: any) {
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
