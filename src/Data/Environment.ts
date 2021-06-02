import {ChatBoxAuthenticationModel} from "../Twitch/Model/ChatBoxAuthenticationModel";
import {IModel} from "./IModel";
import {LogLevel} from "../Log/LogLevel";
import {RedeemCoinModel} from "../Coin/Model/RedeemCoinModel";
import {LogPersistenceModel} from "../Log/Model/LogPersistenceModel";

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
        this.logMinLevel = (LogLevel[environment.logMinLevel] as any) as LogLevel;
        this.chatBoxAuthentication = new ChatBoxAuthenticationModel(environment?.chatBoxAuthentication);
        this.redeemCoin = new RedeemCoinModel(environment.redeemCoin);
        this.log = new LogPersistenceModel(environment.log);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.environment) &&
            this.chatBoxAuthentication.isFilled() &&
            this.redeemCoin.isFilled()
        );
    }

    public get applicationName(): string { return 'Cabr0n Coin' };

    /**
     * Tipo de ambiente.
     */
    public readonly environment: string;

    /**
     * Nível de log.
     */
    public readonly logMinLevel: LogLevel;

    /**
     * Determina se o ambiente atual é de produção.
     */
    public get isProduction(): boolean {
        return this.environment === "production";
    }

    /**
     * Modelo com os dados de autenticação do chatbox na Twitch.
     */
    public readonly chatBoxAuthentication: ChatBoxAuthenticationModel;

    /**
     * Informações do resgate de moedas.
     */
    public readonly redeemCoin: RedeemCoinModel;

    /**
     * Persistência de log.
     */
    public readonly log: LogPersistenceModel;
}
