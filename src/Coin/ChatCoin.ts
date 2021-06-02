import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";
import {RedeemCoinModel} from "./Model/RedeemCoinModel";
import {Message} from "../Bus/Message";
import {RedeemEvent} from "../Twitch/MessageEvent/RedeemEvent";
import {SendChatMessageCommand} from "../Twitch/MessageCommand/SendChatMessageCommand";

/**
 * Escuta do chat da moeda.
 */
export class ChatCoin {
    /**
     * Construtor.
     */
    constructor() {
        const environment = new EnvironmentQuery().request().message.environment;
        this.redeemCoin = environment.redeemCoin;

        Message.capture(RedeemEvent, this, this.onRedeemEvent);
    }

    /**
     * Informações do resgate de moedas
     * @private
     */
    private redeemCoin: RedeemCoinModel;

    /**
     * Processa mensagem
     * @param message RedeemEvent
     * @private
     */
    private onRedeemEvent(message: RedeemEvent) {
        if (message.redeem.id !== this.redeemCoin.id) return;
        new SendChatMessageCommand(message.redeem.channel.name, `Sério que você disse "${message.redeem.message}?"`).send();
    }
}
