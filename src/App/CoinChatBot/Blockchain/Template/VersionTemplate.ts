import {Template} from "./Template";

/**
 * Template: Version
 */
export class VersionTemplate extends Template {

    /**
     * Construtor.
     * @param coin Nome da moeda.
     * @param version Versão da blockchain.
     */
    public constructor(public coin?: string, public version?: string) {
        super('Version');
    }


    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            coin: this.coin ?? '',
            version: this.version ?? ''
        });
    }

}
