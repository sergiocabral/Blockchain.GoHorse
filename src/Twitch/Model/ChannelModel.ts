import {IModel} from "../../Core/IModel";

/**
 * Modelo com os dados do canal.
 */
export class ChannelModel implements IModel {
    /**
     * Construtor.
     * @param channelName Nome do canal.
     */
    public constructor(channelName: string) {
        this.name = channelName ?? '';
        if (this.name) this.name = String(this.name).replace(/^#/, '');
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.name)
        );
    }

    /**
     * Nome do canal
     */
    public name: string;
}
