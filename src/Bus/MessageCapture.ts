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
     * @param toBind Instância usada para bind.
     * @param listenerOriginal Função chamada ao capturar a mensagem.
     */
    public constructor(public message: any, public toBind: any, public listenerOriginal: Function) {
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
        const listener = this.listenerOriginal.bind(this.toBind);
        if (!Message.messagesToIgnoreAtLog.includes(this.messageName)) {
            Logger.post("Message \"{0}\" requested.", this.messageName, LogLevel.Verbose, LogContext.MessageBus);
        }
        listener(message);
    }

    /**top
     * Compara se é conceitualmente igual a outra instância.
     * @param capture Instância para comparar.
     * @returns {boolean} Resposta se é igual.eu
     */
    public equals(capture: MessageCapture): boolean {
        return (
            this.messageName === capture.messageName &&
            this.toBind === capture.toBind &&
            this.listenerOriginal === capture.listenerOriginal
        );
    }
}
