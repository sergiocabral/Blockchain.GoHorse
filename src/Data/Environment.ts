import {ChatBoxAuthentication} from "../Twitch/Model/ChatBoxAuthentication";
import {IModel} from "./IModel";
import {LogLevel} from "../Log/LogLevel";

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
        this.chatBoxAuthentication = new ChatBoxAuthentication(environment?.chatBoxAuthentication);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.environment) &&
            this.chatBoxAuthentication.isFilled()
        );
    }

    public get applicationName(): string { return 'Cabr0n Coin' };

    /**
     * Tipo de ambiente.
     */
    public environment: string;

    /**
     * Nível de log.
     */
    public logMinLevel: LogLevel;

    /**
     * Determina se o ambiente atual é de produção.
     */
    public get isProduction(): boolean {
        return this.environment === "production";
    }

    /**
     * Modelo com os dados de autenticação do chatbox na Twitch.
     */
    public chatBoxAuthentication: ChatBoxAuthentication;
}
