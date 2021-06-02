import {IModel} from "./IModel";

/**
 * Resgates conhecidos.
 */
export class RedeemCoinModel implements IModel {
    /**
     * Construtor.
     * @param data JSON com dados para montar a instância.
     */
    public constructor(data: any) {
        this.id = data?.id ?? '';
        this.amount = data?.amount ?? null;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.id) &&
            Number.isFinite(this.amount)
        );
    }

    /**
     * Identificador do resgate.
     */
    public id: string;

    /**
     * Quantidade resgatada.
     */
    public amount: number;
}
