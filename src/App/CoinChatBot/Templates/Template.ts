import path from "path";
import fs from "fs";

/**
 * Carrega um template de texto.
 */
export class Template {

    /**
     * Contrutor.
     * @param templateName
     */
    public constructor(
        public readonly templateName:
            'humanProblem' |
            'pendingTransaction') {
    }

    /**
     * Conteúdo do template.
     * @private
     */
    private contentValue: string | null = null;

    /**
     * Conteúdo do template.
     */
    public get content(): string {
        if (this.contentValue === null) {
            const filePath = path.resolve(__dirname, `${this.templateName}.txt`);
            this.contentValue = Buffer.from(fs.readFileSync(filePath)).toString();
        }
        return this.contentValue;
    }

}
