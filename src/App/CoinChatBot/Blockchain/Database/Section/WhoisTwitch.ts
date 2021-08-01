import {BaseSection} from "./BaseSection";
import {DatabasePathType} from "../DatabasePathType";
import {UserModel} from "../../../../../Twitch/Model/UserModel";
import {WhoisTwitchTemplate} from "../../Template/WhoisTwitchTemplate";
import sha1 from "sha1";

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
    private static readonly statusInactive = "Replaced on {0}";

    /**
     * Registra um usuário da Twitch.
     * @param twitchUser Usuário da twitch.
     */
    public set(twitchUser: UserModel) {
        const userHashId = sha1(twitchUser.id.toString());
        const currentDateAsText = this.database.persistence.convertDateToText(new Date());

        let content = this.database.persistence.read(WhoisTwitch.whoisTwitchDatabasePath, {"twitch-user-name": twitchUser.name});

        let template: WhoisTwitchTemplate;
        if (content) {
            template = new WhoisTwitchTemplate();
            const values = template.get(content);

            const userUpToDate = values["id"] === userHashId;
            if (userUpToDate) return;

            template.status = WhoisTwitch.statusInactive.querystring(currentDateAsText);

            let index = 0;
            while (!this.database.persistence.write(WhoisTwitch.whoisTwitchOutdatedDatabasePath, {
                "twitch-user-name": twitchUser.name,
                "index": (++index).toString()
            }, template.content)) { }
        }

        template = new WhoisTwitchTemplate(twitchUser.name, userHashId, currentDateAsText, WhoisTwitch.statusActive);
        this.database.persistence.write(WhoisTwitch.whoisTwitchDatabasePath, {"twitch-user-name": template.name}, template.content, true);
    }

    /**
     * Obtem os dados do usuário.
     * @param twitchName Nome do usuário na Twitch.
     */
    public get(twitchName: string): UserModel | null {
        const databasePath: DatabasePathType = '/whois/twitch/{twitch-user-name}';
        const content = this.database.persistence.read(databasePath, { "twitch-user-name": twitchName });
        if (!content) return null;
        const values = new WhoisTwitchTemplate().get(content);
        return UserModel.createTwitchUser(values["name"]);
    }
}
