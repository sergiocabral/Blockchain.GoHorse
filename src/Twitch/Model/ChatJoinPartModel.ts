import {IModel} from "../../Core/IModel";
import {ChannelModel} from "./ChannelModel";

/**
 * Modelo com os dados de entrada ou saída no chat
 */
export class ChatJoinPartModel implements IModel {
    /**
     * Construtor.
     * @param channelName Nome do canal.
     * @param userName Usuário.
     * @param raw Dado original em formato bruto.
     */
    public constructor(channelName: string, userName: string, raw?: any) {
        this.channel = new ChannelModel(channelName);
        this.userName = userName;
        this.raw = raw;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.channel.isFilled() &&
            Boolean(this.userName)
        );
    }

    /**
     * Canal.
     */
    public channel: ChannelModel;

    /**
     * Usuário.
     */
    public userName: string;

    /**
     * Dados bruto.
     */
    public raw?: string;
}
