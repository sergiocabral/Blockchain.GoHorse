import {BaseSection} from "./BaseSection";
import {DatabasePathType} from "../DatabasePathType";
import {UserModel} from "../../../../../Twitch/Model/UserModel";
import {WhoisTwitchTemplate} from "../../Template/WhoisTwitchTemplate";

/**
 * Seção do banco de dados: WhoisTwitch
 */
export class WhoisTwitch extends BaseSection {
    /**
     * Registra um usuário da Twitch.
     * @param twitchUser Usuário da twitch.
     */
    public set(twitchUser: UserModel) {
        const template = new WhoisTwitchTemplate(twitchUser.name, twitchUser.guid, twitchUser.id.toString());
        this.database.persistence.write('/whois/twitch/name/{twitch-user-name}', {"twitch-user-name": template.twitchName}, template.content, true);
        this.database.persistence.write('/whois/twitch/guid/{twitch-user-guid}', {"twitch-user-guid": template.twitchGuid}, template.content, true);
        this.database.persistence.write('/whois/twitch/id/{twitch-user-id}', {"twitch-user-id": template.twitchId}, template.content, true);
    }

    /**
     * Criar um modelo para usuário.
     * @param content Conteúdo.
     * @private
     */
    private static createUserModel(content: string | null): UserModel | null {
        if (!content) return null;
        const values = new WhoisTwitchTemplate().get(content);
        return UserModel.createTwitchUser(
            values["twitch-name"],
            values["twitch-guid"],
            values["twitch-id"]);
    }

    /**
     * Obtem os dados do usuário.
     * @param twitchId Id do usuário na Twitch.
     */
    public getByTwitchId(twitchId: string): UserModel | null {
        const databasePath: DatabasePathType = '/whois/twitch/id/{twitch-user-id}';
        const content = this.database.persistence.read(databasePath, { "twitch-user-id": twitchId });
        return WhoisTwitch.createUserModel(content);
    }

    /**
     * Obtem os dados do usuário.
     * @param twitchGuid Guid do usuário na Twitch.
     */
    public getByTwitchGuid(twitchGuid: string): UserModel | null {
        const databasePath: DatabasePathType = '/whois/twitch/guid/{twitch-user-guid}';
        const content = this.database.persistence.read(databasePath, { "twitch-user-guid": twitchGuid });
        return WhoisTwitch.createUserModel(content);
    }

    /**
     * Obtem os dados do usuário.
     * @param twitchName Nome do usuário na Twitch.
     */
    public getByTwitchName(twitchName: string): UserModel | null {
        const databasePath: DatabasePathType = '/whois/twitch/name/{twitch-user-name}';
        const content = this.database.persistence.read(databasePath, { "twitch-user-name": twitchName });
        return WhoisTwitch.createUserModel(content);
    }
}
