import {Message} from "../../../Bus/Message";
import {HumanProblem} from "../HumanProblem";
import {EmptyValueError} from "../../../Errors/EmptyValueError";

/**
 * Retorna o último HumanProblem na blockchain.
 */
export class GetHumanProblemFromBlockchainCommand extends Message {
    /**
     * Construtor.
     */
    public constructor() {
        super();
    }

    /**
     * Hash (recibo) da transação.
     * @private
     */
    public problem: HumanProblem | null = null;

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
        if (this.hashValue === null) throw new EmptyValueError('GetHumanProblemFromBlockchainCommand.hash');
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
        if (this.urlValue === null) throw new EmptyValueError('GetHumanProblemFromBlockchainCommand.url');
        return this.urlValue;
    }
}
