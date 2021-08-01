import {Message} from "../../Bus/Message";
import {RedeemEvent} from "../../Twitch/MessageEvent/RedeemEvent";
import {CoinModel} from "./Model/CoinModel";
import {ChatListenerHandler} from "../../Twitch/ChatListener/ChatListenerHandler";
import {Blockchain} from "./Blockchain/Blockchain";
import {HelloWorldChatListener} from "../../Twitch/ChatListener/HelloWorldChatListener";

/**
 * Escuta do chat da moeda.
 */
export class ChatCoin {
    /**
     * Construtor.
     * @param coin Dados do ambiente.
     */
    constructor(private coin: CoinModel) {
        this.blockchain = new Blockchain(coin);

        Message.capture(RedeemEvent, this.handlerRedeemEvent.bind(this));

        this.chatListenerHandler = new ChatListenerHandler(coin.channels,
            new HelloWorldChatListener(),
            ...this.blockchain.getChatCommands());
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
    private readonly blockchain: Blockchain;

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
