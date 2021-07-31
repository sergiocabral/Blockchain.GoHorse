import {UserModel} from "../../../../Twitch/Model/UserModel";
import {BaseBlockchainChatCommand} from "./BaseBlockchainChatCommand";

/**
 * Cria um nova carteira
 */
export class TwitchWalletGetCommand extends BaseBlockchainChatCommand {
    /**
     * Construtor.
     * @param twitchUser Usuário da twitch
     */
    public constructor(public readonly twitchUser: UserModel) {
        super();
    }
}
