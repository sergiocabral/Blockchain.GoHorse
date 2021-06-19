import {Template} from "./Template";

/**
 * Template: Version
 */
export class VersionTemplate extends Template {

    /**
     * Construtor.
     * @param coin Nome da moeda.
     * @param majorVersion
     * @param minorVersion
     */
    public constructor(
        public coin?: string,
        public majorVersion?: number,
        public minorVersion?: number) {
        super('Version');
    }


    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "coin": this.coin ?? '',
            "version": this.majorVersion !== undefined && this.minorVersion !== undefined
                ? `${this.majorVersion}.${this.minorVersion}`
                : ''
        });
    }

}
