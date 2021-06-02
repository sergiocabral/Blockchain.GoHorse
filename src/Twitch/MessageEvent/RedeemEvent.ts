import {Message} from "../../Bus/Message";
import {RedeemModel} from "../Model/RedeemModel";

/**
 * Quando um resgate é realizado
 */
export class RedeemEvent extends Message {
    /**
     * Resgate
     * @param redeem
     */
    public constructor(
        public redeem: RedeemModel) {
        super();
    }
}
