import {VersionBase} from "./VersionBase";
import {DatabasePath} from "../DatabasePath";
import {WalletTemplate} from "../../Template/WalletTemplate";
import {Git} from "../../../../../Process/Git";

/**
 * Patcher para aplicar uma versão no repositório. Versão: 1
 */
export class Version001 extends VersionBase {
    /**
     * Aplica a versão.
     */
    public apply(): void {
        this.createFileOfMainWallet();
    }

    private createFileOfMainWallet(): void {
        const databasePath: DatabasePath = '/wallet/{wallet-id}';
        const mainWalletContent = new WalletTemplate(
            this.mainWallet,
            Git.toDate(this.firstBlock.committerDate));
        this.persistence.write(databasePath, mainWalletContent.content, {
            "wallet-id": this.mainWallet
        });
    }
}
