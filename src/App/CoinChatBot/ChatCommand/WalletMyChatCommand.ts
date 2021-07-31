import {BaseChatCommand} from "./BaseChatCommand";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";
import {TwitchWalletGetCommand} from "../Blockchain/Command/TwitchWalletGetCommand";

/**
 * Retorna a carteira do usuário.
 * Comando: !wallet my
 */
export class WalletMyChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string | RegExp)[][] = [
        ["wallet", "my", /^(|[a-fA-F0-9]{8})$/ ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Mensagem original.
     * @protected
     */
    protected run(args: string[], message: ChatMessageModel): string | string[] {
        return new TwitchWalletGetCommand(message.user).request().message.output;
    }
}
