import {BaseSection} from "./BaseSection";
import {DatabasePathType} from "../DatabasePathType";
import {UserModel} from "../../../../../Twitch/Model/UserModel";
import {WhoisTwitchTemplate} from "../../Template/WhoisTwitchTemplate";
import sha1 from "sha1";
import {Persistence} from "../Persistence";

/**
 * Seção do banco de dados: WhoisTwitch
 */
export class WhoisTwitch extends BaseSection {
    /**
     * Caminho do banco de dados para informações do usuário na Twitch.
     * @private
     */
    private static readonly whoisTwitchDatabasePath: DatabasePathType  = '/whois/twitch/{twitch-user-name}';

    /**
     * Caminho do banco de dados para informações do usuário na Twitch que ficaram defasados.
     * @private
     */
    private static readonly whoisTwitchOutdatedDatabasePath: DatabasePathType  = '/whois/twitch/outdated/{twitch-user-name}-{index}';

    /**
     * Mensagem de status: ativo.
     * @private
     */
    private static readonly statusActive = "Active";

    /**
     * Mensagem de status: inativo.
     * @private
     */
    private static readonly statusInactive = "Replaced on {0} UTC";

    /**
     * Registra um usuário da Twitch.
     * @param twitchUser Usuário da twitch.
     * @param quote Mensagem de status
     */
    public set(twitchUser: UserModel, quote: string) {
        const userHashId = sha1(twitchUser.id.toString());

        let content = this.database.persistence.read(WhoisTwitch.whoisTwitchDatabasePath, {"twitch-user-name": twitchUser.name});

        let template: WhoisTwitchTemplate;
        if (content) {
            template = new WhoisTwitchTemplate();
            template.get(content, true);

            const userOutdated = template.id !== userHashId;
            if (userOutdated) {
                template.status = WhoisTwitch.statusInactive.querystring(Persistence.dateToText(new Date()));

                let index = 0;
                while (!this.database.persistence.write(WhoisTwitch.whoisTwitchOutdatedDatabasePath, {
                    "twitch-user-name": twitchUser.name,
                    "index": (++index).toString()
                }, template.content)) { }
            }
        }

        template = new WhoisTwitchTemplate(twitchUser.name, quote, userHashId, new Date(), WhoisTwitch.statusActive);
        this.database.persistence.write(WhoisTwitch.whoisTwitchDatabasePath, {"twitch-user-name": template.name}, template.content, true);
    }

    /**
     * Obtem os dados do usuário.
     * @param twitchName Nome do usuário na Twitch.
     */
    public get(twitchName: string): UserModel | null {
        const content = this.database.persistence.read(WhoisTwitch.whoisTwitchDatabasePath, { "twitch-user-name": twitchName });
        if (!content) return null;
        const values = new WhoisTwitchTemplate().get(content);
        return UserModel.createTwitchUser(values["name"]);
    }

    /**
     * Obtem a url do repositório.
     * @param twitchName Nome do usuário na Twitch.
     */
    public getPath(twitchName: string): string {
        return this.database.persistence.path(WhoisTwitch.whoisTwitchDatabasePath, { "twitch-user-name": twitchName });
    }
}
