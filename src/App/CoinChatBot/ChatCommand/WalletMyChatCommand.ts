import {BaseChatCommand} from "./BaseChatCommand";
import {Text} from "../../../Helper/Text";

/**
 * Retorna a carteira do usuário.
 * Comando: !wallet my
 */
export class WalletMyChatCommand extends BaseChatCommand {
    /**
     * Nome do comando.
     */
    protected subCommands: string[] = [ "wallet", "my" ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        return "You wallet is " + Text.random(undefined, 40);
    }
}
