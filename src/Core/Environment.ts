import {UserAuthenticationModel} from "../Twitch/Model/UserAuthenticationModel";
import {IModel} from "./IModel";
import {LogLevel} from "../Log/LogLevel";
import {RedeemCoinModel} from "../Coin/Model/RedeemCoinModel";
import {LogPersistenceModel} from "../Log/Model/LogPersistenceModel";
import {CoinModel} from "../Coin/Model/CoinModel";

/**
 * Informação de configuração do ambiente.
 */
export class Environment implements IModel {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.environment = environment?.environment ?? '';
        this.language = environment?.language ?? '';
        this.chatBot = new UserAuthenticationModel(environment?.chatBot);
        this.coins = environment.coins?.length ? environment.coins.map((coin: any) => new CoinModel(coin)) : null;
        this.log = new LogPersistenceModel(environment.log);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.environment) &&
            Boolean(this.language) &&
            this.chatBot.isFilled() &&
            Boolean(this.coins?.length) &&
            this.coins.filter(coin => coin.isFilled()).length === this.coins.length
        );
    }

    public get applicationName(): string { return 'Cabr0n Coin' };

    /**
     * Tipo de ambiente.
     */
    public readonly environment: string;

    /**
     * Idioma.
     */
    public readonly language: string;

    /**
     * Determina se o ambiente atual é de produção.
     */
    public get isProduction(): boolean {
        return this.environment === "production";
    }

    /**
     * Modelo com os dados de autenticação do chatbox na Twitch.
     */
    public readonly chatBot: UserAuthenticationModel;

    /**
     * Moedas disponíveis.
     */
    public readonly coins: CoinModel[];

    /**
     * Persistência de log.
     */
    public readonly log: LogPersistenceModel;
}
