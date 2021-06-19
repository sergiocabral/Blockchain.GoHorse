import {BaseError} from "./BaseError";

/**
 * Exception que nunca deveria ocorrer. Se ocorrer foi erro do desenvolvedor mesmo.
 */
export class ShouldNeverHappen extends BaseError {

    /**
     * Construtor.
     * @param message Opcional. Mensagem complementar.
     * @param innerError Erro interno.
     */
    public constructor(message?: string, public innerError?: Error) {
        super("This should never happen", message, innerError);
    }
}
