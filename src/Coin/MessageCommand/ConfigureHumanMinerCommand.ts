import {Message} from "../../Bus/Message";
import {RedeemModel} from "../../Twitch/Model/RedeemModel";
import {RedeemCoinModel} from "../Model/RedeemCoinModel";
import {MathProblem} from "../Model/MathProblem";
import {EmptyValueError} from "../../Errors/EmptyValueError";

/**
 * Comando para iniciar a mineração humana.
 */
export class ConfigureHumanMinerCommand extends Message {
    /**
     * Construtor
     * @param redeem Resgate do usuário.
     * @param data Dados do resgate
     */
    constructor(
        public redeem: RedeemModel,
        public data: RedeemCoinModel) {
        super();
    }

    /**
     * Problema matemático.
     * @private
     */
    private mathProblemValue?: MathProblem;

    /**
     * Problema matemático.
     */
    public set mathProblem(value: MathProblem) {
        this.mathProblemValue = value;
    }

    /**
     * Problema matemático.
     */
    public get mathProblem(): MathProblem {
        if (!this.mathProblemValue)
            throw new EmptyValueError("ConfigureHumanMinerCommand.MathProblem");
        return this.mathProblemValue;
    }
}
