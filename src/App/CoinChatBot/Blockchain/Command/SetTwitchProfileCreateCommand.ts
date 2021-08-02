import {UserModel} from "../../../../Twitch/Model/UserModel";
import {BaseBlockchainChatCommand} from "./BaseBlockchainChatCommand";

/**
 * Cria o perfil do usuário Twitch na blockchain
 */
export class SetTwitchProfileCreateCommand extends BaseBlockchainChatCommand {
    /**
     * Construtor.
     * @param twitchUser Usuário da twitch
     * @param quote Mensagem do status
     */
    public constructor(
        public readonly twitchUser: UserModel,
        public readonly quote: string) {
        super();
    }
}
