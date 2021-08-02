import {Template} from "./Template";
import {KeyValue} from "../../../../Helper/Types/KeyValue";

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

    /**
     * Lê os parâmetros do conteúdo.
     * @param content Conteúdo do arquivo.
     * @param writeValues Escreve os valores lidos na instâncias
     */
    public override get(content: string, writeValues: boolean = false): KeyValue {
        const result = super.get(content, writeValues);
        if (writeValues) {
            const version = result["version"];
            this.majorVersion = parseInt(version.replace(/\..*/, ''));
            this.minorVersion = parseInt(version.replace(/.*\./, ''));
        }
        return result;
    }

}
