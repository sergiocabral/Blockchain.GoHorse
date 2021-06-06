import {Message} from "../../../Bus/Message";
import {PendingTransactionModel} from "../Model/PendingTransactionModel";
import {EmptyValueError} from "../../../Errors/EmptyValueError";

/**
 * Inserir uma transação pendente de mineraçã na blockchain.
 */
export class PutPendingTransactionIntoBlockchainAction extends Message {
    /**
     * Construtor.
     * @param pendingTransaction Transação pendente a entrar na blockchain.
     */
    public constructor(
        public readonly pendingTransaction: PendingTransactionModel) {
        super();
    }

    /**
     * Hash (recibo) da transação.
     * @private
     */
    private hashValue: string | null = null;

    /**
     * Hash (recibo) da transação.
     */
    public set hash(value: string) {
        this.hashValue = value;
    }

    /**
     * Hash (recibo) da transação.
     */
    public get hash(): string {
        if (this.hashValue === null) throw new EmptyValueError('PutHumanProblemIntoBlockchainAction.hash');
        return this.hashValue;
    }

    /**
     * Url no GitHub
     * @private
     */
    private urlValue: string | null = null;

    /**
     * Url no GitHub.
     */
    public set url(value: string) {
        this.urlValue = value;
    }

    /**
     * Url no GitHub.
     */
    public get url(): string {
        if (this.urlValue === null) throw new EmptyValueError('PutHumanProblemIntoBlockchainAction.url');
        return this.urlValue;
    }
}
