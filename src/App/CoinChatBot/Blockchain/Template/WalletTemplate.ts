import {Template} from "./Template";
import {Persistence} from "../Database/Persistence";
import {KeyValue} from "../../../../Helper/Types/KeyValue";

/**
 * Template: Wallet
 */
export class WalletTemplate extends Template {

    /**
     * Construtor.
     * @param walletId Id da carteira
     * @param date Data
     */
    public constructor(
        public walletId?: string,
        public date?: Date) {
        super('Wallet');
    }


    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "walletId": this.walletId ?? '',
            "date": this.date ? Persistence.dateToText(this.date) : ''
        });
    }

    /**
     * Lê os parâmetros do conteúdo.
     * @param content Conteúdo do arquivo.
     * @param writeValues Escreve os valores lidos na instâncias
     */
    public override get(content: string, writeValues: boolean = false): KeyValue {
        const result = super.get(content, writeValues);
        if (writeValues) {
            this.date = Persistence.textToDate(result["date"]);
        }
        return result;
    }
}
