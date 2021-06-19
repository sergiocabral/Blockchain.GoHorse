import {ChatListener} from "../ChatListener";

/**
 * Classe base para comandos de chat.
 */
export abstract class ChatCommand extends ChatListener{
    /**
     * Comando a ser tratado.
     */
    public abstract get command(): string;
}
