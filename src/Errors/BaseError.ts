/**
 * Base para todos os erros do sistema.
 */
export abstract class BaseError extends Error {

    /**
     * Construtor.
     * @param error Descrição do erro.
     * @param message Mensagem complementar.
     * @param innerError Erro interno.
     */
    protected constructor(error: string, message?: string, public innerError?: Error) {
        super("FAIL: " + error + (message ? ": " + message : "."));
    }

    /**
     * Verifica se um objeto é um instância de erro.
     * @param object Alvo do teste.
     */
    public static isError(object: any): boolean {
        return (
            object &&
            typeof(object) === "object" &&
            String(object.constructor.name).toLowerCase().indexOf("error") >= 0
        );
    }
}
