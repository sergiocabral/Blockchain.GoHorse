import {CoinModel} from "../../../Model/CoinModel";
import {Persistence} from "../Persistence";

/**
 * Patcher para aplicar uma versão no repositório.
 */
export abstract class VersionBase {
    /**
     * Construtor.
     * @param persistence Manipulador de entrada e saída no disco.
     * @param coin Moeda
     */
    public constructor(
        protected readonly persistence: Persistence,
        protected readonly coin: CoinModel) {
    }

    /**
     * Aplica a versão.
     */
    public abstract apply(): void;
}
