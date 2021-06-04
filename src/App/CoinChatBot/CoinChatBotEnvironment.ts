import {UserAuthenticationModel} from "../../Twitch/Model/UserAuthenticationModel";
import {IModel} from "../../Core/IModel";
import {CoinModel} from "./Model/CoinModel";

/**
 * Informação de configuração do ambiente da aplicação Chatbot.
 */
export class CoinChatBotEnvironment implements IModel {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.twitchAccount = new UserAuthenticationModel(environment?.twitchAccount);
        this.coins = environment.coins?.length ? environment.coins.map((coin: any) => new CoinModel(coin)) : null;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.twitchAccount.isFilled() &&
            Boolean(this.coins?.length) &&
            this.coins.filter(coin => coin.isFilled()).length === this.coins.length
        );
    }

    /**
     * Autenticação do chatbox na Twitch.
     */
    public readonly twitchAccount: UserAuthenticationModel;

    /**
     * Moedas disponíveis.
     */
    public readonly coins: CoinModel[];

    /**
     * Todos os canais relacionados.
     */
    public get allChannels(): string[] {
        return this.coins.map(coin => coin.channels).flat<string>();
    }
}
