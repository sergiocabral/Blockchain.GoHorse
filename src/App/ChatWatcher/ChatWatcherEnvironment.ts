import {UserAuthenticationModel} from "../../Twitch/Model/UserAuthenticationModel";
import {IModel} from "../../Core/IModel";
import {KeyValue} from "../../Helper/Types/KeyValue";

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

        this.automaticFirstMessagesForTag = {};
        for (const channel of Object.keys(environment?.automaticFirstMessagesForTag)) {
            this.automaticFirstMessagesForTag[channel.toLowerCase()] = {};
            for (const tag of Object.keys(environment?.automaticFirstMessagesForTag[channel])) {
                this.automaticFirstMessagesForTag[channel.toLowerCase()][tag.toLowerCase()] = environment?.automaticFirstMessagesForTag[channel][tag];
            }
        }

        this.tags = {};
        for (const tag of Object.keys(environment?.tags)) {
            this.tags[tag.toLowerCase()] = environment?.tags[tag];
        }

        this.autoStreamHolicsTerms = environment?.autoStreamHolicsTerms;

        this.outputFile = environment?.outputFile ?? '';
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.twitchAccount.isFilled() &&
            Boolean(this.channels?.length) &&
            Boolean(this.tags) &&
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
     * Comando para tags.
     */
    public readonly automaticFirstMessagesForTag: KeyValue<KeyValue<string[]>>;

    /**
     * Tags vinculadas a usuários.
     */
    public readonly tags: KeyValue;

    /**
     * Termos usados para um usuário chamar o auto !SH.
     */
    public readonly autoStreamHolicsTerms: string[];

    /**
     * Arquivo de saída do relatório.
     */
    public readonly outputFile: string;
}
