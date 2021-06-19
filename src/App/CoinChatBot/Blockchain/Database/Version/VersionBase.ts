import {CoinModel} from "../../../Model/CoinModel";
import {Persistence} from "../Persistence";
import {CommitModel} from "../../../../../Process/Model/CommitModel";

/**
 * Patcher para aplicar uma versão no repositório.
 */
export abstract class VersionBase {
    /**
     * Construtor.
     * @param persistence Manipulador de entrada e saída no disco.
     * @param firstBlock Informações do primeiro bloco.
     * @param coin Moeda
     */
    public constructor(
        protected readonly persistence: Persistence,
        public readonly firstBlock: CommitModel,
        protected readonly coin: CoinModel) {
    }

    /**
     * Wallet principal.
     */
    public get mainWallet(): string {
        return this.firstBlock.hash;
    }

    /**
     * Aplica a versão.
     */
    public abstract apply(): void;
}
