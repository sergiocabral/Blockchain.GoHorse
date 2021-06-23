import {CoinModel} from "../../Model/CoinModel";
import {Patcher} from "./Patcher";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";
import {Git} from "../../../../Process/Git";
import {WalletModel} from "./Model/WalletModel";
import {VersionSection} from "./Section/VersionSection";
import {WalletSection} from "./Section/WalletSection";


/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Extensão padrão dos arquivos.
     * @private
     */
    public readonly version: number = 1;

    /**
     * Construtor.
     * @param coin Moeda
     * @param firstBlock Informações do primeiro bloco.
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        public readonly coin: CoinModel,
        public readonly firstBlock: CommitModel,
        public readonly directory: string) {
        this.persistence = new Persistence(directory);
        this.patcher = new Patcher(this.persistence, firstBlock, coin);
    }

    /**
     * Manipulador de entrada e saída no disco.
     * @private
     */
    public readonly persistence: Persistence;

    /**
     * Gerenciador de versões do repositório.
     * @private
     */
    private patcher: Patcher;

    /**
     * Seções do banco de dados.
     * @private
     */
    private section = {
        /**
         * Versão
         */
        version: new VersionSection(this),

        /**
         * Carteiras
         */
        wallet: new WalletSection(this)
    }

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): number | boolean {
        const structureVersion = this.section.version.get();
        const applicationVersion = this.version;
        const newVersion = this.patcher.updateStructure(structureVersion, applicationVersion);
        if (typeof(newVersion) === 'number') this.section.version.set(newVersion);

        switch (this.version) {
            case 1:
                this.section.wallet.set(new WalletModel(this.firstBlock.hash, Git.toDate(this.firstBlock.committerDate)));
                break;
        }

        return newVersion;
    }
}
