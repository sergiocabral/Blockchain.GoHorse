import {BaseChatCommand} from "./BaseChatCommand";
import {Text} from "../../../Helper/Text";

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
     * @protected
     */
    protected run(args: string[]): string | string[] {
        //TODO: Implementar
        return "You wallet is " + Text.random(undefined, 40);
    }
}
