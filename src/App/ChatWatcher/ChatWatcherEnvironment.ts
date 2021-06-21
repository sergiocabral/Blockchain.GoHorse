import {UserAuthenticationModel} from "../../Twitch/Model/UserAuthenticationModel";
import {IModel} from "../../Core/IModel";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {AutomaticResponseList} from "./UserWatcher/AutomaticResponseList";

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

        try {
            this.firstMessageAutomaticResponseList = new AutomaticResponseList(environment?.firstMessageAutomaticResponseList);
            this.generalMessageAutomaticResponseList = new AutomaticResponseList(environment?.generalMessageAutomaticResponseList);
        } catch (e) {
            this.firstMessageAutomaticResponseList = undefined as any;
            this.generalMessageAutomaticResponseList = undefined as any;
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
            Boolean(this.autoStreamHolicsTerms) &&
            Boolean(this.firstMessageAutomaticResponseList) &&
            Boolean(this.generalMessageAutomaticResponseList) &&
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
     * Configuração de resposta automática para primeira mensagem.
     */
    public readonly firstMessageAutomaticResponseList: AutomaticResponseList;

    /**
     * Configuração de resposta automática para mensagens em geral.
     */
    public readonly generalMessageAutomaticResponseList: AutomaticResponseList;

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
