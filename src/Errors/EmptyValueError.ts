import {BaseError} from "./BaseError";

/**
 * Esperado valor, mas constava undefined.
 */
export class EmptyValueError extends BaseError {

    /**
     * Construtor.
     * @param message Opcional. Mensagem complementar.
     * @param innerError Erro interno.
     */
    public constructor(message?: string, public innerError?: Error) {
        super("Empty not expected", message, innerError);
    }
}
