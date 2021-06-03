import {ChatBot} from "../Twitch/ChatBot";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {ChatCoin} from "../Coin/ChatCoin";
import {BaseApp} from "./BaseApp";

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

        this.chatBot = new ChatBot();
        this.chatCoin = new ChatCoin();
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
    private readonly chatCoin: ChatCoin;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        super.run();

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatBot: {0}`, error, LogLevel.Error, LogContext.MainApp));
    }
}
