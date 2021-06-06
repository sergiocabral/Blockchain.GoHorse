import {Message} from "../../Bus/Message";
import {RedeemEvent} from "../../Twitch/MessageEvent/RedeemEvent";
import {SendChatMessageAction} from "../../Twitch/MessageAction/SendChatMessageAction";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {CoinModel} from "./Model/CoinModel";
import {HumanMiner} from "./HumanMiner";
import {ComputerMiner} from "./ComputerMiner";
import {RedeemModel} from "../../Twitch/Model/RedeemModel";
import {RedeemCoinModel} from "./Model/RedeemCoinModel";
import {CreateHumanMinerAction} from "./MessageAction/CreateHumanMinerAction";
import {CurrentHumanMinerQuery} from "./MessageQuery/CurrentHumanMinerQuery";
import {Git} from "../../Process/Git";
import {InvalidExecutionError} from "../../Errors/InvalidExecutionError";
import {Blockchain} from "./Blockchain";
import {PutPendingTransactionIntoBlockchainAction} from "./MessageAction/PutPendingTransactionIntoBlockchainAction";
import {PendingTransactionModel} from "./Model/PendingTransactionModel";
import {ChatCommandHandler} from "../../Twitch/ChatCommand/ChatCommandHandler";
import {HelloWorldChatCommand} from "../../Twitch/ChatCommand/HelloWorldChatCommand";

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

        this.chatCommandHandler = new ChatCommandHandler(coin.channels, new HelloWorldChatCommand());
    }

    /**
     * Gerenciador de captura de comandos do chat
     * @private
     */
    private readonly chatCommandHandler: ChatCommandHandler;

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
            this.registerPendingTransaction(message.redeem, redeem);
            this.startHumanMiner(message.redeem, redeem);
        }
    }

    /**
     * Resgate de moeda.
     * @param redeem Resgate do usuário.
     * @param data Dados do resgate
     * @private
     */
    private registerPendingTransaction(redeem: RedeemModel, data: RedeemCoinModel): void {
        const message2 =
            new PutPendingTransactionIntoBlockchainAction(
                new PendingTransactionModel(redeem, data, this.coin))
                .request().message;
        const pendingTransaction = message2.pendingTransaction;

        Logger.post(
            'Redeemed requested in the chat "{0}", by user "{1}", with amount {2}. Description of redeem: "{3}". Message from user: "{4}"',
            [
                pendingTransaction.channel.name,
                pendingTransaction.user.name,
                pendingTransaction.amount,
                pendingTransaction.userMessage],
            LogLevel.Information,
            LogContext.ChatCoin);

        const message = (
            `@${pendingTransaction.user.name}, ${data.description.translate()} ` +
            "The transaction has been queued - {url} - until the mining is complete. After that your balance will be updated and your message will be publicly registered on the blockchain --> {message}"
                .translate()
                .querystring({
                    url: message2.url,
                    message: pendingTransaction.userMessage
                })
        );

        this.coin.channels.forEach(channel =>
            new SendChatMessageAction(channel, message).send());
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
            currentHumanMiner = new CreateHumanMinerAction(redeem, data).request().message.humanMinerRequest;
        }

        Logger.post(
            `Human miner ${(isNew ? 'started' : 'continued')} for coin: "{0}". Channels: "{1}". Math problem: {2}`,
            [this.coin.id, this.coin.channels.join(', '), currentHumanMiner.humanProblem.problem],
            LogLevel.Information,
            LogContext.ChatCoin);

        const message = (
            'Pending human mining: {url} ' +
            'Solve the math problem to receive the miner reward. ' +
            'To reply send !miner {answer} --> ' +
            '{problem}').translate().querystring({
                url: currentHumanMiner.url,
                problem: currentHumanMiner.humanProblem.problemFormattedAndTranslated
            });

        this.coin.channels.forEach(channel =>
            new SendChatMessageAction(channel, message).send());
    }
}
