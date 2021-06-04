import {IModel} from "../../../Core/IModel";

/**
 * Modelo para um resgates conhecido.
 */
export class RedeemCoinModel implements IModel {
    /**
     * Construtor.
     * @param data JSON com dados para montar a instância.
     */
    public constructor(data: any) {
        this.id = data?.id ?? '';
        this.description = data?.description ?? '';
        this.amount = data?.amount ?? null;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.id) &&
            Boolean(this.description) &&
            Number.isFinite(this.amount)
        );
    }

    /**
     * Identificador do resgate.
     */
    public id: string;

    /**
     * Descrição do resgate.
     */
    public description: string;

    /**
     * Quantidade resgatada.
     */
    public amount: number;
}
