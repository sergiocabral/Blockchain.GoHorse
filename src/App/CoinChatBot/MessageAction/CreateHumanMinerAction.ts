import {Message} from "../../../Bus/Message";
import {RedeemModel} from "../../../Twitch/Model/RedeemModel";
import {RedeemCoinModel} from "../Model/RedeemCoinModel";
import {EmptyValueError} from "../../../Errors/EmptyValueError";
import {HumanMinerRequestModel} from "../Model/HumanMinerRequestModel";

/**
 * Comando para iniciar a mineração humana.
 */
export class CreateHumanMinerAction extends Message {
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
     * Requisição de mineração humana.
     */
    private humanMinerRequestValue?: HumanMinerRequestModel;

    /**
     * Requisição de mineração humana.
     */
    public set humanMinerRequest(value: HumanMinerRequestModel) {
        this.humanMinerRequestValue = value;
    }

    /**
     * Requisição de mineração humana.
     */
    public get humanMinerRequest(): HumanMinerRequestModel {
        if (!this.humanMinerRequestValue)
            throw new EmptyValueError("CreateHumanMinerAction.HumanMinerRequestModel");
        return this.humanMinerRequestValue;
    }
}
