import path from "path";
import fs from "fs";
import {CoinModel} from "../../Model/CoinModel";
import {Patcher} from "./Patcher";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";
import {DatabasePath} from "./DatabasePath";
import {WalletTemplate} from "../Template/WalletTemplate";
import {Git} from "../../../../Process/Git";
import {WalletModel} from "./Model/WalletModel";

/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Extensão padrão dos arquivos.
     * @private
     */
    private readonly version: number = 1;

    /**
     * Construtor.
     * @param coin Moeda
     * @param firstBlock Informações do primeiro bloco.
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        private readonly coin: CoinModel,
        public readonly firstBlock: CommitModel,
        private readonly directory: string) {
        this.persistence = new Persistence(directory);
        this.patcher = new Patcher(this.persistence, firstBlock, coin);
    }

    /**
     * Manipulador de entrada e saída no disco.
     * @private
     */
    private persistence: Persistence;

    /**
     * Gerenciador de versões do repositório.
     * @private
     */
    private patcher: Patcher;

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): number | boolean {
        const newVersion = this.patcher.updateStructure(this.version);

        switch (this.version) {
            case 1:
                this.setWallet(new WalletModel(this.firstBlock.hash, Git.toDate(this.firstBlock.committerDate)));
                break;
        }

        return newVersion;
    }

    /**
     * Cria uma carteira.
     * @param wallet Carteira.
     */
    public setWallet(wallet: WalletModel): boolean {
        const databasePath: DatabasePath = '/wallet/{wallet-id}';
        const mainWalletContent = new WalletTemplate(wallet.id, this.persistence.convertDateToText(wallet.creation));
        return this.persistence.write(databasePath, { "wallet-id": wallet.id }, mainWalletContent.content);
    }

    /**
     * Consulta uma carteira.
     * @param walletId Hash da carteira
     */
    public getWallet(walletId: string): WalletModel | null {
        const databasePath: DatabasePath = '/wallet/{wallet-id}';
        const content = this.persistence.read(databasePath, { "wallet-id": walletId });
        if (!content) return null;
        const values = new WalletTemplate().get(content);
        return new WalletModel(
            values["wallet-id"],
            this.persistence.convertTextToDate(values["date-utc"]),
        );
    }

    public writeAnything(): string {
        const file = path.resolve(this.directory, new Date().getTime() + ".txt");
        fs.writeFileSync(file, file);
        return path.basename(file);
    }
}
