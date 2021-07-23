import {Template} from "./Template";

/**
 * Template: Help
 */
export class HelpTemplate extends Template {
    /**
     * Construtor.
     * @param coin Nome da moeda.
     * @param help Conteúdo da ajuda.
     */
    public constructor(
        public coin?: string,
        public help?: string) {
        super('Help');
    }

    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "coin": this.coin ?? '',
            "help": this.help ?? ''
        });
    }
}
