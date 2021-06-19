import {IModel} from "../../../../../Core/IModel";

/**
 * Carteira.
 */
export class WalletModel implements IModel {
    /**
     * Construtor.
     * @param id Hash da carteira.
     * @param creation Data de criação.
     */
    public constructor(
        public id: string,
        public creation: Date = new Date()) {
    }

    /**
     * Determina se o modelo está preenchido.
     */
    isFilled(): boolean {
        return (
            /^[0-9a-f]{40}$/.test(this.id) &&
            this.creation.getTime() > 0
        );
    }
}
