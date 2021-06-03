import {IModel} from "../IModel";
import {CoinChatBotEnvironment} from "./CoinChatBotEnvironment";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";

/**
 * Aplicações configuradas.
 */
export class ApplicationEnvironment implements IModel {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.coinChatBot = new CoinChatBotEnvironment(environment?.coinChatBot);
        this.chatWatcher = new ChatWatcherEnvironment(environment?.chatWatcher);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.coinChatBot.isFilled()
        );
    }

    /**
     * Aplicação CoinChatBot
     */
    public readonly coinChatBot: CoinChatBotEnvironment;

    /**
     * Aplicação ChatWatcher
     */
    public readonly chatWatcher: ChatWatcherEnvironment;
}
