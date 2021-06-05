import {IModel} from "../../../Core/IModel";
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
        this.instanceName = data?.instanceName ?? '';
        this.id = data?.id ?? '';
        this.name = data?.name ?? null;
        this.repositoryUrl = data?.repositoryUrl ?? null;
        this.repository = data?.repository ?? null;
        this.directory = data?.directory ?? null;
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
     * Identificador da instância do minerador.
     */
    public instanceName: string;

    /**
     * Identificador.
     */
    public id: string;

    /**
     * Nome.
     */
    public name: string;

    /**
     * Url do repositório do Git.
     */
    public repositoryUrl: string;

    /**
     * Repositório do Git.
     */
    public repository: string;

    /**
     * Diretório da blockchain (repositório do Git local)
     */
    public directory: string;

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
