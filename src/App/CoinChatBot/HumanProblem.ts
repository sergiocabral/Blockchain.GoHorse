import {IModel} from "../../Core/IModel";
import fs from "fs";
import path from "path";
import {Text} from "../../Helper/Text";
import {MathProblem} from "./Model/MathProblem";

export abstract class HumanProblem implements IModel {
    /**
     * O problema.
     */
    public abstract problem: string;

    /**
     * Problema formatado para exibição
     * @private
     */
    public abstract get problemFormatted(): string;

    /**
     * Problema formatado para exibição e traduzido.
     * @private
     */
    public abstract get problemFormattedAndTranslated(): string;

    /**
     * Determina se o problema está resolvido.
     */
    public abstract get isSolved(): boolean;

    /**
     * O gabarito.
     */
    public abstract answer: number;

    /**
     * Determina se o modelo está preenchido.
     */
    public abstract isFilled(): boolean;

    /**
     * Template para montagem do texto.
     * @private
     */
    private static templateValue: string | null = null;

    /**
     * Template para montagem do texto.
     * @private
     */
    private static get template(): string {
        if (this.templateValue === null) {
            const fileName = "humanProblem.txt";
            const filePath = path.resolve(__dirname, 'Templates', fileName);
            this.templateValue = Buffer.from(fs.readFileSync(filePath)).toString();
        }
        return this.templateValue;
    }

    /**
     * Representação do problema como texto.
     */
    public asText(): string {
        return HumanProblem.template.querystring({
            "problem": this.problemFormatted,
            "type": Text.getObjectName(this),
            "created": new Date().toISOString(),
            "solved": "???",
            "who": "???",
            "answer": "???",
        });
    }

    /**
     * Reconstroi o HumanProblem com base no conteúdo do arquivo.
     * @param fileContent
     */
    public static factory(fileContent: string): HumanProblem | null {
        const match = /^Type:\s+(\w+)$/m.exec(fileContent);
        const type = match?.length === 2 && match[1];
        if (type === "MathProblem") return MathProblem.factory(fileContent);
        else return null;
    }
}
