import {ChatMessageModel} from "../../Model/ChatMessageModel";
import {ChatListener} from "../ChatListener";

/**
 * Comando Hello Word.
 */
export class HelloWorldChatMessage extends ChatListener {
    /**
     * Sinaliza que é um comando.
     * Nesse caso mensage se refere ao nome do comando,
     * ao invés do texto da mensagem
     */
    public get isCommand(): boolean {
        return false;
    }

    /**
     * Comando a ser tratado.
     */
    public get message(): string {
        return 'hello';
    };

    /**
     * Execução do comando.
     * @param chatMessage Mensagem do chat.
     * @return Texto a ser enviado para o chat.
     */
    public response(chatMessage: ChatMessageModel): string {
        return `world, @${chatMessage.user.name}`;
    }
}
