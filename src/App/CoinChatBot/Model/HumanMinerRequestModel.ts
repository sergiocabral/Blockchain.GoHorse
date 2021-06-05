import {IModel} from "../../../Core/IModel";
import {HumanProblem} from "../HumanProblem";

/**
 * Modelo de uma requisição de mineração humana.
 */
export class HumanMinerRequestModel implements IModel {
    /**
     * Construtor.
     * @param humanProblem Problema para humano resolver.
     * @param url Url no GitHub
     */
    public constructor(
        public humanProblem: HumanProblem,
        public url: string) {
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            this.humanProblem.isFilled()
        );
    }
}
