import {BaseChatCommand} from "./BaseChatCommand";
import {DatabasePathType} from "../Blockchain/Database/DatabasePathType";
import {Definition} from "../Blockchain/Definition";

/**
 * Ajuda para o uso da blockchain.
 * Comando: !wallet my
 */
export class HelpChatCommand extends BaseChatCommand {
    /**
     * Nome do comando.
     */
    protected subCommands: string = "help";

    private  = '/d';

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @protected
     */
    protected run(args: string[]): string | string[] {
        const branchName = this.miner.branchName;
        const helpFile: DatabasePathType = '/docs/help';
        const extension = Definition.FileExtension.length ? '.' + Definition.FileExtension : '';
        return `Access help in this link {url}`.translate().querystring({
            url: `${this.coin.repositoryUrl}/blob/${branchName}${helpFile}${extension}`
        });
    }
}
