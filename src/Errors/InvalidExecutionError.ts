import {BaseError} from "./BaseError";

/**
 * Argumento inválido.
 */
export class InvalidExecutionError extends BaseError {

    /**
     * Construtor.
     * @param message Opcional. Mensagem complementar.
     * @param innerError Erro interno.
     */
    public constructor(message?: string, public innerError?: Error) {
        super("Invalid execution", message, innerError);
    }
}
