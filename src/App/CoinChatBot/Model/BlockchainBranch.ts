import {IModel} from "../../../Core/IModel";
import {CoinModel} from "./CoinModel";
import {Git} from "../../../Process/Git";
import {InvalidExecutionError} from "../../../Errors/InvalidExecutionError";
import {EmptyValueError} from "../../../Errors/EmptyValueError";

/**
 * Informações de um branch da blockchain
 */
export class BlockchainBranch implements IModel {

    /**
     * Construtor.
     * @param coin Moeda.
     * @param name Nome do branch
     */
    public constructor(
        private coin: CoinModel,
        public readonly name: string) {
        this.branchName = `coin-${this.coin.id}-${this.name}`;
        this.mainFileName = `${this.name}.txt`;
    }


    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            Boolean(this.name)
        );
    }

    /**
     * Branch vazio.
     * @private
     */
    public static readonly emptyBranchName: string = 'first-block';

    /**
     * Branch para o HumanMiner
     * @private
     */
    public readonly branchName: string;

    /**
     * Nome do arquivo principal do branch.
     */
    public readonly mainFileName: string;

    /**
     * Instância do Git.
     * @private
     */
    private gitInstance: Git | null = null;

    /**
     * Instância do Git.
     * @param value
     */
    public set git(value: Git) {
        if (this.gitInstance !== null) throw new InvalidExecutionError('Value already defined: BlockchainBranch.git');
        this.gitInstance = value;
    }

    /**
     * Instância do Git.
     */
    public get git(): Git {
        if (this.gitInstance === null) throw new EmptyValueError('BlockchainBranch.git');
        return this.gitInstance;
    }
}
