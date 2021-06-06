/**
 * Classe base para comandos de chat.
 */
export abstract class ChatCommand {
    /**
     * Comando a ser tratado.
     */
    public readonly abstract command: string;

    /**
     * Execução do comando.
     * @param args Argumentos recebidos.
     * @return Texto a ser enviado para o chat.
     */
    public abstract run(args: string[]): string
}
