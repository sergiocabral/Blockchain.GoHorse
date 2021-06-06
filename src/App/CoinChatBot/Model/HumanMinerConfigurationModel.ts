import {IModel} from "../../../Core/IModel";
import {MathProblemConfigurationModel} from "./MathProblemConfigurationModel";

export class HumanMinerConfigurationModel implements IModel {
    /**
     * Construtor.
     * @param data JSON com dados para preencher a instância.
     */
    public constructor(data: any) {
        this.mathProblem = new MathProblemConfigurationModel(data?.mathProblem);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            this.mathProblem.isFilled()
        );
    }

    /**
     * Configuração do Math Problem.
     */
    public mathProblem: MathProblemConfigurationModel;
}
