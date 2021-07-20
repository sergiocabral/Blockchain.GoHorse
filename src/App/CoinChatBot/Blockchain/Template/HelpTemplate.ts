import {Template} from "./Template";

/**
 * Template: Help
 */
export class HelpTemplate extends Template {
    /**
     * Construtor.
     * @param coin Nome da moeda.
     * @param version Versão do documento de ajuda.
     */
    public constructor(
        public coin?: string,
        public version?: string) {
        super('Help');
    }

    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "coin": this.coin ?? ''
        });
    }
}
