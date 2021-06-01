import {MessageCapture} from "./MessageCapture";
import {Text} from "../Helper/Text";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {MessageRequested} from "./MessageRequested";
import {InvalidExecutionError} from "../Errors/InvalidExecutionError";
import {LogContext} from "../Log/LogContext";

/**
 * Despachador de mensagens e ancestral de mensagens.
 */
export abstract class Message {

    /**
     * Lista de capturar registradas.
     */
    private static captures: MessageCapture[] = [];

    /**
     * Se registrar para capturar uma mensagem.
     * @param message Mensagem.
     * @param thisRef Instância usada para bind.
     * @param listener Função chamada ao captura.
     * @returns Informações de captura.
     */
    public static capture(message: any, thisRef: any, listener: Function): MessageCapture {
        const capture = new MessageCapture(message, thisRef, listener);
        if (this.captures.filter(v => v.equals(capture)).length)
            throw new InvalidExecutionError("Duplicate Message.capture().");
        this.captures.push(capture);
        return capture;
    }

    /**
     * Cancela a captura de uma mensagem.
     * @param {MessageCapture} capture Informações de captura.
     */
    public static captureOff(capture: MessageCapture): void {
        if (!this.captures.filter((v, i, a) => {
            if (v.equals(capture)) {
                delete a[i];
                return true;
            } else {
                return false;
            }
        }).length) throw new InvalidExecutionError("Message.capture() not executed.");
    }

    /**
     * Envia uma mensagem para processamento.
     */
    public sendAsync(): Promise<MessageRequested<this>> {
        return Message.sendAsync<this>(this);
    }

    /**
     * Envia uma mensagem para processamento.
     * @param message Mensagem
     */
    public static sendAsync<TMessage extends Message>(message: TMessage): Promise<MessageRequested<TMessage>> {
        return new Promise(resolve => resolve(Message.send(message)));
    }

    /**
     * Requisita o processamento da mensagem.
     */
    public send(): MessageRequested<this> {
        return Message.send<this>(this);
    }

    /**
     * Requisita o processamento da mensagem.
     * @param message Mensagem
     */
    public static send<TMessage extends Message>(message: TMessage): MessageRequested<TMessage> {
        const messageName = Text.getObjectName(message);
        const captures = this.captures.filter(v => v.messageName === messageName);
        if (captures.length) {
            for (const capture of captures) capture.request(message);
            Logger.post("Message \"{0}\" sent and captured by {1}x.", [messageName, captures.length], LogLevel.Verbose, LogContext.MessageBus);
        } else {
            Logger.post("Message \"{0}\" sent but not captured.", messageName, LogLevel.Verbose, LogContext.MessageBus);
        }
        return {captured: captures.length, message: message};
    }
}
