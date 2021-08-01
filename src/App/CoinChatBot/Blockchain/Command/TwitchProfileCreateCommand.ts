import {UserModel} from "../../../../Twitch/Model/UserModel";
import {BaseBlockchainChatCommand} from "./BaseBlockchainChatCommand";

/**
 * Cria o perfil do usuário Twitch na blockchain
 */
export class TwitchProfileCreateCommand extends BaseBlockchainChatCommand {
    /**
     * Construtor.
     * @param twitchUser Usuário da twitch
     */
    public constructor(public readonly twitchUser: UserModel) {
        super();
    }
}
