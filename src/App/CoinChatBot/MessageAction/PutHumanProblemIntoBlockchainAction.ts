import {Message} from "../../../Bus/Message";
import {HumanProblem} from "../Model/HumanProblem";
import {EmptyValueError} from "../../../Errors/EmptyValueError";

/**
 * Insere um HumanProblem na blockchain.
 */
export class PutHumanProblemIntoBlockchainAction extends Message {
    /**
     * Construtor.
     * @param problem Problema humano.
     */
    public constructor(public problem: HumanProblem) {
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
