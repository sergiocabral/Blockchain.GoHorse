import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";
import {Message} from "../Bus/Message";
import {RedeemEvent} from "../Twitch/MessageEvent/RedeemEvent";
import {SendChatMessageCommand} from "../Twitch/MessageCommand/SendChatMessageCommand";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {CoinModel} from "./Model/CoinModel";
import {HumanMiner} from "./HumanMiner";
import {ComputerMiner} from "./ComputerMiner";

/**
 * Escuta do chat da moeda.
 */
export class ChatCoin {
    /**
     * Construtor.
     */
    constructor() {
        const environment = new EnvironmentQuery().request().message.environment;
        this.coins = environment.application.coinChatBot.coins;

        this.humanMiner = new HumanMiner();
        this.computerMiner = new ComputerMiner();

        Message.capture(RedeemEvent, this, this.handlerRedeemEvent);
    }

    /**
     * Minerador humano
     * @private
     */
    private readonly humanMiner: HumanMiner;

    /**
     * Minerador computacional
     * @private
     */
    private readonly computerMiner: ComputerMiner;

    /**
     * Moedas disponíveis
     * @private
     */
    private readonly coins: CoinModel[];

    /**
     * Processa mensagem
     * @param message RedeemEvent
     * @private
     */
    private handlerRedeemEvent(message: RedeemEvent) {
        let coins = this.coins;
        if (coins.length === 0) return;

        coins = coins.filter(coin => coin.channels.filter(channelName => channelName === message.redeem.channel.name).length);
        if (coins.length === 0) return;

        coins = coins.filter(coin => coin.redeems.filter(redeem => redeem.id === message.redeem.id).length);
        if (coins.length === 0) return;

        for (const coin of coins) {
            const redeems = coin.redeems.filter(redeem => redeem.id === message.redeem.id);
            for (const redeem of redeems) {
                Logger.post(
                    'Redeemed requested in the chat "{0}", by user "{1}", with amount {2}. Description of redeem: "{3}". Message from user: "{4}"',
                    [message.redeem.channel.name, message.redeem.user.name, redeem.amount, redeem.description, message.redeem.message, message],
                    LogLevel.Information,
                    LogContext.ChatCoin)

                new SendChatMessageCommand(message.redeem.channel.name, redeem.description.translate()).send();
            }
        }
    }
}
