import {Message} from "../../../Bus/Message";
import {HumanMinerRequestModel} from "../Model/HumanMinerRequestModel";

/**
 * Recebe a mineração humana atualmente pendente.
 */
export class CurrentHumanMinerQuery extends Message {
    /**
     * Requisição de mineração humana.
     */
    public humanMinerRequest: HumanMinerRequestModel | null = null;
}
