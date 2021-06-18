import {Template} from "./Template";

/**
 * Template: HumanProblem
 */
export class HumanProblemTemplate extends Template {

    /**
     * Construtor.
     */
    public constructor() {
        super('HumanProblem');
    }


    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.templateContent;
    }

}
