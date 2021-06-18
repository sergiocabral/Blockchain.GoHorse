import {Text} from "../../../Helper/Text";
import {MathProblem} from "./MathProblem";
import {IModelPrintable} from "../../../Core/IModelPrintable";
import {HumanProblemTemplate} from "../Blockchain/Template/HumanProblemTemplate";

/**
 * Classe base para problemas que humanos podem resolver como forma de mineração.
 */
export abstract class HumanProblem implements IModelPrintable {
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
     * Representação do problema como texto.
     */
    public asText(): string {
        return new HumanProblemTemplate().templateContent.querystring({
            "problem": this.problemFormatted,
            "type": Text.getObjectName(this),
            "created": new Date().toISOString(),
            "solved": "???",
            "who": "???",
            "answer": "???",
            "reward": "???",
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
