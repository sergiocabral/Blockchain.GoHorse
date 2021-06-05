import {IModel} from "../../../Core/IModel";
import {NumericFormat} from "../../../Helper/NumericFormat";
import {HumanProblem} from "../HumanProblem";

/**
 * Modelo para um problema matemático.
 */
export class MathProblem extends HumanProblem implements IModel {
    /**
     * Construtor.
     * @param problem A expressão.
     * @param answer O resultado.
     */
    public constructor(
        public problem: string,
        public answer: number) {
        super();
    }

    /**
     * Constante para texto: Plus.
     * @private
     */
    private static readonly TEXT_PLUS: string = "plus";

    /**
     * Constante para texto: Minus.
     * @private
     */
    private static readonly TEXT_MINUS: string = "minus";

    /**
     * Constante para texto: Multiplied by.
     * @private
     */
    private static readonly TEXT_MULTIPLIED_BY: string = "multiplied by";

    /**
     * Constante para texto: Divided by.
     * @private
     */
    private static readonly TEXT_DIVIDED_BY: string = "divided by";

    /**
     * Problema formatado para exibição
     * @private
     */
    public get problemFormatted(): string {
        return this.problem
            .replaceAll("+", MathProblem.TEXT_PLUS)
            .replaceAll("-", MathProblem.TEXT_MINUS)
            .replaceAll("*", MathProblem.TEXT_MULTIPLIED_BY)
            .replaceAll("/", MathProblem.TEXT_DIVIDED_BY);
    }

    /**
     * Problema formatado para exibição
     * @private
     */
    public set problemFormatted(value: string) {
        this.problem = value
            .replaceAll(MathProblem.TEXT_PLUS, "+")
            .replaceAll(MathProblem.TEXT_MINUS, "-")
            .replaceAll(MathProblem.TEXT_MULTIPLIED_BY, "*")
            .replaceAll(MathProblem.TEXT_DIVIDED_BY, "/");
        this.answer = this.calculatedAnswer;
    }

    /**
     * Problema formatado para exibição e traduzido.
     * @private
     */
    public get problemFormattedAndTranslated(): string {
        return this.problem
            .replaceAll(".", NumericFormat.decimal)
            .replaceAll("+", MathProblem.TEXT_PLUS.translate())
            .replaceAll("-", MathProblem.TEXT_MINUS.translate())
            .replaceAll("*", MathProblem.TEXT_MULTIPLIED_BY.translate())
            .replaceAll("/", MathProblem.TEXT_DIVIDED_BY.translate());
    }

    /**
     * Determina se o problema está resolvido.
     */
    public get isSolved(): boolean {
        return Math.round(this.answer) === this.calculatedAnswer;
    }

    /**
     * Resposta calculada.
     */
    public get calculatedAnswer(): number {
        return Math.round(eval(this.problem));
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.problem) &&
            Number.isFinite(this.answer)
        );
    }

    /**
     * Reconstroi o MathProblem com base no conteúdo do arquivo.
     * @param fileContent
     */
    public static factory(fileContent: string): MathProblem | null {
        const firstLine = /^.*$/m.exec(fileContent);
        if (firstLine?.length != 1) return null;

        const problem = new MathProblem('', 0);
        problem.problemFormatted = firstLine[0];
        problem.answer = Number.MIN_SAFE_INTEGER;

        return problem;
    }
}
