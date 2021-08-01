import {BaseSection} from "./BaseSection";
import {WalletModel} from "../Model/WalletModel";
import {DatabasePathType} from "../DatabasePathType";
import {WalletTemplate} from "../../Template/WalletTemplate";
import {UserModel} from "../../../../../Twitch/Model/UserModel";
import sha1 from "sha1";
import {Definition} from "../../Definition";

/**
 * Seção do banco de dados: Wallet.
 */
export class WalletSection extends BaseSection {
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
     * Converte um usuário em um hash de carteira.
     * @param twitchUser
     * @private
     */
    private static twitchUserToWalletId(twitchUser: UserModel): string {
        return sha1(sha1(`${Definition.Stamp}${twitchUser.id}`));
    }

    /**
     * Cria uma carteira.
     * @param twitchUser Usuário da twitch.
     */
    public setByTwitchUser(twitchUser: UserModel): boolean {
        const walletId = WalletSection.twitchUserToWalletId(twitchUser);
        const wallet = new WalletModel(walletId, new Date());
        return this.set(wallet);
    }

    /**
     * Consulta uma carteira.
     * @param twitchUser Usuário da twitch.
     */
    public getByTwitchUser(twitchUser: UserModel): WalletModel | null {
        const walletId = WalletSection.twitchUserToWalletId(twitchUser);
        return this.get(walletId);
    }
}
