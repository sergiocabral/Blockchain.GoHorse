import {Text} from "../Helper/Text";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {Message} from "./Message";
import {LogContext} from "../Log/LogContext";

/**
 * Informações da mensagem que deve ser capturada.
 */
export class MessageCapture {
    /**
     * Construtor.
     * @param message Mensagem
     * @param listenerOriginal Função chamada ao capturar a mensagem.
     */
    public constructor(public message: any, public listenerOriginal: Function) {
        this.messageName = Text.getObjectName(message);
    }

    /**
     * Identificador da mensagem como string.
     */
    public messageName: string;

    /**
     * Requisita a execução do listener e retorna o valor.
     * @param message Mensagem.
     */
    public request(message: Message): void {
        if (!Message.messagesToIgnoreAtLog.includes(this.messageName)) {
            Logger.post("Message {messageName} requested.", {messageName: this.messageName}, LogLevel.Verbose, LogContext.MessageBus);
        }
        this.listenerOriginal(message);
    }

    /**top
     * Compara se é conceitualmente igual a outra instância.
     * @param capture Instância para comparar.
     * @returns {boolean} Resposta se é igual.eu
     */
    public equals(capture: MessageCapture): boolean {
        return (
            this.messageName === capture.messageName &&
            this.listenerOriginal === capture.listenerOriginal
        );
    }
}
