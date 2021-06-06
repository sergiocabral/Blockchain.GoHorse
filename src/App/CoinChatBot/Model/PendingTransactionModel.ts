import {RedeemModel} from "../../../Twitch/Model/RedeemModel";
import {RedeemCoinModel} from "./RedeemCoinModel";
import {ChannelModel} from "../../../Twitch/Model/ChannelModel";
import {UserModel} from "../../../Twitch/Model/UserModel";
import {IModelPrintable} from "../../../Core/IModelPrintable";
import {Template} from "../Templates/Template";
import {CoinModel} from "./CoinModel";

export class PendingTransactionModel implements IModelPrintable {
    /**
     * Construtor.
     * @param redeem Resgate do usuário.
     * @param data Dados estáticos do resgate.
     * @param coin Moeda.
     */
    public constructor(
        private readonly redeem: RedeemModel,
        private readonly data: RedeemCoinModel,
        private readonly coin: CoinModel) {
        this.channel = redeem.channel;
        this.user = redeem.user;
        this.userMessage = redeem.message;
        this.amount = data.amount;
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.channel) &&
            Boolean(this.user) &&
            Boolean(this.userMessage) &&
            this.amount > 0
        );
    }

    /**
     * Canal.
     */
    public channel: ChannelModel;

    /**
     * Usuário.
     */
    public user: UserModel;

    /**
     * Mensagem pública do usuário.
     */
    public userMessage: string;

    /**
     * Quantidade de moedas.
     */
    public amount: number;

    /**
     * Representação do problema como texto.
     */
    public asText(): string {
        return new Template('pendingTransaction').content.querystring({
            "channel": this.channel.name,
            "userId": `${this.user.id}, ${this.user.guid}`,
            "userName": this.user.name,
            "userMessage": this.userMessage,
            "amount": this.amount.format({
                decimal: '.',
                miles: ',',
                digits: 8,
                prefix: '',
                suffix: ` $ ${this.coin.name}`,
                showPositive: false
            }),
            "created": new Date().toISOString()
        });
    }
}
