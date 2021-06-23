import {BaseChatCommand} from "./BaseChatCommand";

/**
 * Ajuda para o uso da blockchain.
 * Comando: !wallet my
 */
export class HelpChatCommand extends BaseChatCommand {
    /**
     * Nome do comando.
     */
    protected subCommands: string = "help";

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        return `Access help in this link {url}`.translate().querystring({ url: this.coin.repositoryUrl });
    }
}
