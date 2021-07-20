import {BaseSection} from "./BaseSection";
import {ShouldNeverHappen} from "../../../../../Errors/ShouldNeverHappen";
import {HelpTemplate} from "../../Template/HelpTemplate";

/**
 * Seção do banco de dados: Arquivo de ajuda.
 */
export class HelpSection extends BaseSection {
    /**
     * Cria a estrutura inicial
     */
    public set(): void {
        const versionTemplate = new HelpTemplate(this.database.coin.name);
        this.database.persistence.write('/docs/help', undefined, versionTemplate.content, true);
    }

    /**
     * Conteúdo da ajuda atual.
     */
    public get(): string {
        const helpContent = this.database.persistence.read("/docs/help", undefined, '', false);
        if (!helpContent) throw new ShouldNeverHappen();
        return helpContent;
    }
}
