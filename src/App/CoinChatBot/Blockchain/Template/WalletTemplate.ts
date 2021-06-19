import {Template} from "./Template";

/**
 * Template: Version
 */
export class WalletTemplate extends Template {

    /**
     * Construtor.
     * @param walletId Id da carteira
     * @param date Data
     */
    public constructor(
        public walletId?: string,
        public date?: string) {
        super('Wallet');
    }


    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "wallet-id": this.walletId ?? '',
            "date-utc": this.date ?? ''
        });
    }

}
