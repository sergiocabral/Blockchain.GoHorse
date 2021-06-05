import {Message} from "../../Bus/Message";

/**
 * Evento de clock do sistema.
 */
export class ClockEvent extends Message {
    /**
     * Pulsos já disparados.
     * @private
     */
    public static pulsesInSeconds: number = 0;

    /**
     * Construtor.
     * @param pulse Pulsos corridos.
     */
    constructor(public readonly pulse: number) {
        super();
    }

    /**
     * Determina se passaram tantos segundos.
     * @param seconds Segundos.
     */
    public hasElapsedSeconds(seconds: number): boolean {
        return this.pulse % seconds === 0;
    }

    /**
     * Determina se passaram tantos minutos.
     * @param minutes Minutos.
     */
    public hasElapsedMinutes(minutes: number): boolean {
        return this.hasElapsedSeconds(minutes * 60);
    }
}
