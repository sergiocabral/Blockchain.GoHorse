import {ChatMessageModel} from "../Model/ChatMessageModel";
import {ChatListener} from "./ChatListener";
import {Numeric} from "../../Helper/Numeric";

/**
 * Comando Hello Word.
 */
export class HelloWorldChatListener extends ChatListener {
    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        return (
            (!message.isCommand && message.message.trim().toLowerCase() === "hello") ||
            (message.isCommand && message.command === "hello")
        );
    }

    /**
     * Responde uma mensagem.
     * @param message
     * @return Texto de resposta.
     */
    public response(message: ChatMessageModel): string {
        return `hello world, @${message.user.name}... your lucky ${message.isCommand ? 'command' : 'message'} number is ${Numeric.random(2)}`;
    }
}
