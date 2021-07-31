import {BaseSection} from "./BaseSection";
import {WalletModel} from "../Model/WalletModel";
import {DatabasePathType} from "../DatabasePathType";
import {WalletTemplate} from "../../Template/WalletTemplate";
import {Database} from "../Database";
import {Message} from "../../../../../Bus/Message";
import {TwitchWalletCreateCommand} from "../../Command/TwitchWalletCreateCommand";
import {TwitchWalletGetCommand} from "../../Command/TwitchWalletGetCommand";

/**
 * Seção do banco de dados: Wallet.
 */
export class WalletSection extends BaseSection {
    /**
     * Construtor.
     * @param database Banco de dados.
     * @protected
     */
    public constructor(protected database: Database) {
        super(database);
        Message.capture(TwitchWalletCreateCommand, this.handlerTwitchWalletCreateCommand.bind(this));
        Message.capture(TwitchWalletGetCommand, this.handlerTwitchWalletGetCommand.bind(this));
    }

    /**
     * Cria uma carteira.
     * @param wallet Carteira.
     */
    public set(wallet: WalletModel): boolean {
        const databasePath: DatabasePathType = '/wallet/{wallet-id}';
        const mainWalletContent = new WalletTemplate(wallet.id, this.database.persistence.convertDateToText(wallet.creation));
        return this.database.persistence.write(databasePath, { "wallet-id": wallet.id }, mainWalletContent.content);
    }

    /**
     * Consulta uma carteira.
     * @param walletId Hash da carteira
     */
    public get(walletId: string): WalletModel | null {
        const databasePath: DatabasePathType = '/wallet/{wallet-id}';
        const content = this.database.persistence.read(databasePath, { "wallet-id": walletId });
        if (!content) return null;
        const values = new WalletTemplate().get(content);
        return new WalletModel(
            values["wallet-id"],
            this.database.persistence.convertTextToDate(values["date-utc"]),
        );
    }

    /**
     * Capturador de comando.
     * @param message CreateWallet
     * @private
     */
    private handlerTwitchWalletCreateCommand(message: TwitchWalletCreateCommand): void {
        message.output.push("TwitchWalletCreateCommand");
    }

    /**
     * Capturador de comando.
     * @param message CreateWallet
     * @private
     */
    private handlerTwitchWalletGetCommand(message: TwitchWalletGetCommand): void {
        message.output.push("TwitchWalletGetCommand");
    }
}
