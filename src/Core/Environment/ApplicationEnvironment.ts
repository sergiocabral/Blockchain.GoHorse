import {IModel} from "../IModel";
import {CoinChatBoxEnvironment} from "./CoinChatBoxEnvironment";

/**
 * Aplicações configuradas.
 */
export class ApplicationEnvironment implements IModel {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.coinChatBox = new CoinChatBoxEnvironment(environment?.coinChatBox);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.coinChatBox.isFilled()
        );
    }

    /**
     * Aplicação CoinChatBox
     */
    public readonly coinChatBox: CoinChatBoxEnvironment;
}
