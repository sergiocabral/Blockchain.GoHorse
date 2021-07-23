import {BaseChatCommand} from "./BaseChatCommand";
import {Text} from "../../../Helper/Text";

/**
 * Cria uma carteira com base no usuário da Twitch
 * Comando: !cabr0n wallet new
 */
export class WalletNewByTwitchChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: string[] = [ "wallet", "new" ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        //TODO: Implementar
        return "Your wallet was created " + Text.random(undefined, 40);
    }
}
