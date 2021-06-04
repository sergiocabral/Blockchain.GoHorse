import {IModel} from "../../Core/IModel";
import {RedeemCoinModel} from "./RedeemCoinModel";
import {HumanMinerConfigurationModel} from "./HumanMinerConfigurationModel";

/**
 * Modelo para informações de uma moeda.
 */
export class CoinModel implements IModel {
    /**
     * Construtor.
     * @param data JSON com dados para montar a instância.
     */
    public constructor(data: any) {
        this.id = data?.id ?? '';
        this.name = data?.name ?? null;
        this.channels = data?.channels ?? null;
        this.redeems = data?.redeems ?? null;
        this.humanMiner = new HumanMinerConfigurationModel(data?.humanMiner) ?? null;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.id) &&
            Boolean(this.name) &&
            Boolean(this.channels?.length) &&
            Boolean(this.redeems?.length) &&
            this.humanMiner.isFilled()
        );
    }

    /**
     * Identificador.
     */
    public id: string;

    /**
     * Nome.
     */
    public name: string;

    /**
     * Canal da Twitch onde a moeda pode ser operada.
     */
    public channels: string[];

    /**
     * Resgates possíveis.
     */
    public redeems: RedeemCoinModel[];

    /**
     * Configurações do minerador humano.
     */
    public humanMiner: HumanMinerConfigurationModel;
}
