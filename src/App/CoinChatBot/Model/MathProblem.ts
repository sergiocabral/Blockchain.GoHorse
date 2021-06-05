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
     * @param result O resultado.
     */
    public constructor(
        public problem: string,
        public result: number) {
        super();
        this.problem = problem
            .replaceAll(".", NumericFormat.decimal)
            .replaceAll("+", "plus".translate())
            .replaceAll("-", "minus".translate())
            .replaceAll("*", "multiplied by".translate())
            .replaceAll("/", "divided by".translate());
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.problem) &&
            Number.isFinite(this.result)
        );
    }
}
