import {BaseChatCommand} from "./BaseChatCommand";
import {HelpGetCommand} from "../Blockchain/Command/HelpGetCommand";

/**
 * Ajuda para o uso da blockchain.
 * Comando: !cabr0n help [language]
 */
export class HelpChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string|RegExp)[][] = [
        [ "help", /.*/ ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        const argLanguageIndex = 2;
        const language = args[argLanguageIndex] ?? undefined;
        return new HelpGetCommand(language).request().message.output;
    }
}
