import {IModel} from "../../Core/IModel";
import {NumericFormat} from "../../Helper/NumericFormat";

/**
 * Modelo para um problema matemático.
 */
export class MathProblem implements IModel {
    /**
     * Construtor.
     * @param problem A expressão.
     * @param result O resultado.
     */
    public constructor(
        public problem: string,
        public result: number) {
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
