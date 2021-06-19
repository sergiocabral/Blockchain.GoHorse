import {Message} from "../../Bus/Message";
import {RedeemEvent} from "../../Twitch/MessageEvent/RedeemEvent";
import {CoinModel} from "./Model/CoinModel";
import {ChatListenerHandler} from "../../Twitch/ChatListener/ChatListenerHandler";
import {CoinCommandQueue} from "./Blockchain/CoinCommandQueue";
import {HelloWorldChatCommand} from "../../Twitch/ChatListener/Example/HelloWorldChatCommand";
import {HelloWorldChatMessage} from "../../Twitch/ChatListener/Example/HelloWorldChatMessage";

/**
 * Escuta do chat da moeda.
 */
export class ChatCoin {
    /**
     * Construtor.
     * @param coin Dados do ambiente.
     */
    constructor(private coin: CoinModel) {
        this.coinCommandQueue = new CoinCommandQueue(coin);

        Message.capture(RedeemEvent, this, this.handlerRedeemEvent);

        this.chatListenerHandler = new ChatListenerHandler(coin.channels,
            new HelloWorldChatCommand(),
            new HelloWorldChatMessage());
    }

    /**
     * Gerenciador de captura de comandos do chat
     * @private
     */
    private readonly chatListenerHandler: ChatListenerHandler;

    /**
     * Responsável por enfileirar comandos para operar a moeda.
     * @private
     */
    private readonly coinCommandQueue: CoinCommandQueue;

    /**
     * Processa mensagem
     * @param message RedeemEvent
     * @private
     */
    private handlerRedeemEvent(message: RedeemEvent) {
        const matchChannel = this.coin.channels.filter(channelName => channelName === message.redeem.channel.name).length
        if (!matchChannel) return;

        const matchRedeem = this.coin.redeems.filter(redeem => redeem.id === message.redeem.id).length;
        if (!matchRedeem) return;

        const redeems = this.coin.redeems.filter(redeem => redeem.id === message.redeem.id);
        for (const redeem of redeems) {
            //TODO: Registrar no bloco pendente + iniciar mineração humana
        }
    }
}
