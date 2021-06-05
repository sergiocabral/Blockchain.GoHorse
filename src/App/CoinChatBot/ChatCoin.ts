import {Message} from "../../Bus/Message";
import {RedeemEvent} from "../../Twitch/MessageEvent/RedeemEvent";
import {SendChatMessageCommand} from "../../Twitch/MessageCommand/SendChatMessageCommand";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {CoinModel} from "./Model/CoinModel";
import {HumanMiner} from "./HumanMiner";
import {ComputerMiner} from "./ComputerMiner";
import {RedeemModel} from "../../Twitch/Model/RedeemModel";
import {RedeemCoinModel} from "./Model/RedeemCoinModel";
import {CreateHumanMinerCommand} from "./MessageCommand/CreateHumanMinerCommand";
import {CurrentHumanMinerQuery} from "./MessageQuery/CurrentHumanMinerQuery";
import {Git} from "../../Process/Git";
import {InvalidExecutionError} from "../../Errors/InvalidExecutionError";
import {Blockchain} from "./Blockchain";

/**
 * Escuta do chat da moeda.
 */
export class ChatCoin {
    /**
     * Construtor.
     * @param coin Dados do ambiente.
     */
    constructor(private coin: CoinModel) {
        if (!Git.isInstalled) {
            Logger.post('Git is not installed.', undefined, LogLevel.Error, LogContext.ChatCoin);
            throw new InvalidExecutionError('Git is not installed');
        }

        this.humanMiner = new HumanMiner(coin.humanMiner);
        this.computerMiner = new ComputerMiner();
        this.blockchain = new Blockchain(coin);

        Message.capture(RedeemEvent, this, this.handlerRedeemEvent);
    }

    /**
     * Operações da blockchain
     * @private
     */
    private readonly blockchain: Blockchain;

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
     * Processa mensagem
     * @param message RedeemEvent
     * @private
     */
    private handlerRedeemEvent(message: RedeemEvent) {
        const needHandleChannel = this.coin.channels.filter(channelName => channelName === message.redeem.channel.name).length
        if (!needHandleChannel) return;

        const needHandleRedeem = this.coin.redeems.filter(redeem => redeem.id === message.redeem.id).length;
        if (!needHandleRedeem) return;

        const redeems = this.coin.redeems.filter(redeem => redeem.id === message.redeem.id);
        for (const redeem of redeems) {
            ChatCoin.redeemCoinNotify(message.redeem, redeem);
            this.startHumanMiner(message.redeem, redeem);
        }
    }

    /**
     * Resgate de moeda.
     * @param redeem Resgate do usuário.
     * @param data Dados do resgate
     * @private
     */
    private static redeemCoinNotify(redeem: RedeemModel, data: RedeemCoinModel): void {
        Logger.post(
            'Redeemed requested in the chat "{0}", by user "{1}", with amount {2}. Description of redeem: "{3}". Message from user: "{4}"',
            [redeem.channel.name, redeem.user.name, data.amount, data.description, redeem.message],
            LogLevel.Information,
            LogContext.ChatCoin)

        const message = `@${redeem.user.name}, ${data.description.translate()} ${"Your message will be publicly registered at blockchain --> {0}".translate().querystring(redeem.message)}`;
        new SendChatMessageCommand(redeem.channel.name, message).send();
    }

    /**
     * Resgate de moeda.
     * @param redeem Resgate do usuário.
     * @param data Dados do resgate
     * @private
     */
    private startHumanMiner(redeem: RedeemModel, data: RedeemCoinModel): void {
        let currentHumanMiner = new CurrentHumanMinerQuery().request().message.humanMinerRequest;
        const isNew = !currentHumanMiner;
        if (!currentHumanMiner) {
            currentHumanMiner = new CreateHumanMinerCommand(redeem, data).request().message.humanMinerRequest;
        }

        Logger.post(
            `Human miner ${(isNew ? 'started' : 'continued')} for coin: "{0}". Channels: "{1}". Math problem: {2}`,
            [this.coin.id, this.coin.channels.join(', '), currentHumanMiner.humanProblem.problem],
            LogLevel.Information,
            LogContext.ChatCoin)

        const message = (
            'Pending human mining: {url} ' +
            'Solve the math problem to receive the miner reward. ' +
            'To reply send !miner {answer} --> ' +
            '{problem}').translate().querystring({
                url: currentHumanMiner.url,
                problem: currentHumanMiner.humanProblem.problemFormattedAndTranslated
            });

        this.coin.channels.forEach(channel =>
            new SendChatMessageCommand(channel, message).send());
    }
}
