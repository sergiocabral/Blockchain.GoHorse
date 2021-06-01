import {BaseError} from "./BaseError";

/**
 * Argumento inválido.
 */
export class InvalidArgumentError extends BaseError {

    /**
     * Construtor.
     * @param message Opcional. Mensagem complementar.
     * @param innerError Erro interno.
     */
    public constructor(message?: string, public innerError?: Error) {
        super("Invalid argument", message, innerError);
    }
}
