import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {ChatCoin} from "./ChatCoin";
import {BaseApp} from "../../Core/BaseApp";
import {CoinChatBotEnvironment} from "./CoinChatBotEnvironment";

/**
 * Aplicação: chatbot da Cabr0n Coin.
 */
export class CoinChatBotApp extends BaseApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        super('coinChatBot', environment);

        this.chatBot = new ChatBot(this.environmentApplication.twitchAccount, this.environmentApplication.allChannels);
        this.chatCoins = this.environmentApplication.coins.map(coin => new ChatCoin(coin));
    }

    /**
     * Dados do ambiente para a aplicação.
     * @private
     */
    private get environmentApplication(): CoinChatBotEnvironment {
        return this.environment.application.coinChatBot;
    }

    /**
     * Cliente ChatBot da Twitch.
     * @private
     */
    private readonly chatBot: ChatBot;

    /**
     * Escuta do chat da moeda.
     * @private
     */
    private readonly chatCoins: ChatCoin[];

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        super.run();

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatBot: {message}`, {message: error}, LogLevel.Error, LogContext.CoinChatBotApp));
    }
}
