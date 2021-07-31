import {BaseChatCommand} from "./BaseChatCommand";
import {TwitchWalletCreateCommand} from "../Blockchain/Command/TwitchWalletCreateCommand";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";

/**
 * Cria uma carteira com base no usuário da Twitch
 * Comando: !cabr0n wallet new
 */
export class WalletNewByTwitchChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string | RegExp)[][] = [
        [ "wallet", "new" ],
        [ /^-?wn$/ ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Mensagem original.
     * @protected
     */
    protected run(args: string[], message: ChatMessageModel): string | string[] {
        return new TwitchWalletCreateCommand(message.user).request().message.output;
    }
}
