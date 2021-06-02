import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";
import {RedeemCoinModel} from "./Model/RedeemCoinModel";
import {Message} from "../Bus/Message";
import {RedeemEvent} from "../Twitch/MessageEvent/RedeemEvent";
import {SendChatMessageCommand} from "../Twitch/MessageCommand/SendChatMessageCommand";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";

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

        Logger.post(
            'Redeemed requested in the chat "{0}", pelo usuário "{1}", no valor de {2}. Mensagem: "{3}"',
            [message.redeem.channel.name, message.redeem.user.name, this.redeemCoin.amount, message.redeem.message, message],
            LogLevel.Information,
            LogContext.ChatCoin)

        new SendChatMessageCommand(message.redeem.channel.name, `Sério que você disse "${message.redeem.message}?"`).send();
    }
}
