import {IModel} from "../../Core/IModel";
import fs from "fs";
import path from "path";
import {Text} from "../../Helper/Text";

export abstract class HumanProblem implements IModel {
    /**
     * O problema.
     */
    public abstract problem: string;

    /**
     * O gabarito.
     */
    public abstract result: number;

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
            "problem": this.problem,
            "type": Text.getObjectName(this),
            "created": new Date().toISOString(),
            "solved": "???",
            "who": "???",
        });
    }
}
