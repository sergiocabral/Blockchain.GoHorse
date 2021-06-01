import {Message} from "./Message";

/**
 * Despachador de mensagens e ancestral de mensagens.
 */
export type MessageRequested<TMessage extends Message> = {

    /**
     * Mensagem processada.
     */
    message: TMessage;

    /**
     * Contagem de processamentos da mensagem.
     */
    captured: number;
}
