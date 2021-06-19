import {ChatMessageModel} from "../Model/ChatMessageModel";
import {ChatListener} from "./ChatListener";

/**
 * Command para responder com !SH (Stream Holics)
 */
export class StreamHolicsChatListener extends ChatListener {
    /**
     * Construtor.
     * @param terms Termos capturados.
     */
    public constructor(public terms: string[] = [
        "Stream Holics",
        "StreamHolics",
        "sh"
    ]) {
        super();
        this.terms = this.terms.map(term => term.slug());
    }

    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        return this.terms.includes(message.message.slug());
    }

    /**
     * Responde uma mensagem.
     * @param message
     * @return Texto de resposta.
     */
    public response(message: ChatMessageModel): string {
        return `!sh @${message.user.name}`;
    }
}
