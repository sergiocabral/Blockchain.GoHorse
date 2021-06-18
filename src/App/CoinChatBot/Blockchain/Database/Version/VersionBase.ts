import {CoinModel} from "../../../Model/CoinModel";

/**
 * Patcher para aplicar uma versão no repositório.
 */
export abstract class VersionBase {
    /**
     * Construtor.
     * @param coin Moeda
     */
    public constructor(protected coin: CoinModel) {
    }

    /**
     * Aplica a versão.
     */
    public abstract apply(): void;
}
