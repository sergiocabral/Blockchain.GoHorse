import {IModel} from "../../../Core/IModel";
import {MathProblem} from "./MathProblem";

/**
 * Modelo de uma requisição de mineração humana.
 */
export class HumanMinerRequestModel implements IModel {
    /**
     * Construtor.
     * @param mathProblem Problema matemático.
     */
    public constructor(public mathProblem: MathProblem) {
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            this.mathProblem.isFilled()
        );
    }
}
