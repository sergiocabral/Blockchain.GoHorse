import {IModel} from "../../Core/IModel";

export class HumanMinerModel implements IModel {
    /**
     * Construtor.
     * @param data JSON com dados para preencher a instância.
     */
    public constructor(data: any) {
        this.operationCount = Number(data?.operationCount ?? null);
        this.minIntegerPart = Number(data?.minIntegerPart ?? null);
        this.maxIntegerPart = Number(data?.maxIntegerPart ?? null);
        this.digits = Number(data?.digits ?? null);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            Number.isFinite(this.operationCount) && this.operationCount > 0 &&
            Number.isFinite(this.minIntegerPart) && this.minIntegerPart >= 0 &&
            Number.isFinite(this.maxIntegerPart) &&
            Number.isFinite(this.digits) && this.digits >= 0
        );
    }

    /**
     * Total de operações matemáticas
     */
    public operationCount: number;

    /**
     * Menor número possível na parte inteira de cada número
     */
    public minIntegerPart: number;

    /**
     * Maior número possível na parte inteira de cada número
     */
    public maxIntegerPart: number;

    /**
     * Dígitos decimais em cada número
     */
    public digits: number;
}
