import {BaseChatCommand} from "./BaseChatCommand";

/**
 * Ajuda para o uso da blockchain.
 * Comando: !cabr0n help [language]
 */
export class HelpChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string|RegExp)[] = [ "help", /.*/ ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        const argLanguageIndex = 2;
        const language = args[argLanguageIndex] ?? undefined;
        const helpLink = this.database.getHelpLink(language);
        return `Access help in this link: {helpLink}`.translate().querystring({ helpLink });
    }
}
