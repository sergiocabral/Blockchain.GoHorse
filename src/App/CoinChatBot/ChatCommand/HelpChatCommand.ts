import {BaseChatCommand} from "./BaseChatCommand";
import {GetHelpCommand} from "../Blockchain/Command/GetHelpCommand";

/**
 * Ajuda para o uso da blockchain.
 * Comando: !cabr0n help [language]
 */
export class HelpChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string|RegExp)[][] = [
        [ /^-{0,2}help$/, /.*/ ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        const argLanguageIndex = 2;
        const language = args[argLanguageIndex] ?? undefined;
        return new GetHelpCommand(language).request().message.output;
    }
}
