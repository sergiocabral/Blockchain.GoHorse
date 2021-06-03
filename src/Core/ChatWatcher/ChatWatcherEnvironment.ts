import {UserAuthenticationModel} from "../../Twitch/Model/UserAuthenticationModel";
import {IModel} from "../IModel";

/**
 * Informação de configuração do ambiente da aplicação ChatWatcher.
 */
export class ChatWatcherEnvironment implements IModel {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.twitchAccount = new UserAuthenticationModel(environment?.twitchAccount);
        this.channels = environment?.channels?.length ? environment.channels : null;
        this.outputFile = environment?.outputFile ?? '';
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.twitchAccount.isFilled() &&
            Boolean(this.channels?.length) &&
            Boolean(this.outputFile)
        );
    }

    /**
     * Autenticação do chatbox na Twitch.
     */
    public readonly twitchAccount: UserAuthenticationModel;

    /**
     * Moedas disponíveis.
     */
    public readonly channels: string[];

    /**
     * Arquivo de saída do relatório.
     */
    public readonly outputFile: string;
}
