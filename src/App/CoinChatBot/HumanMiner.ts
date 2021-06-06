import {Message} from "../../Bus/Message";
import {CreateHumanMinerAction} from "./MessageAction/CreateHumanMinerAction";
import {FactoryMathProblem} from "./FactoryMathProblem";
import {HumanMinerConfigurationModel} from "./Model/HumanMinerConfigurationModel";
import {HumanMinerRequestModel} from "./Model/HumanMinerRequestModel";
import {CurrentHumanMinerQuery} from "./MessageQuery/CurrentHumanMinerQuery";
import {PutHumanProblemIntoBlockchainAction} from "./MessageAction/PutHumanProblemIntoBlockchainAction";
import {GetHumanProblemFromBlockchainAction} from "./MessageAction/GetHumanProblemFromBlockchainAction";

/**
 * Minerador humano.
 */
export class HumanMiner {
    /**
     * Constructor.
     * @param config Configurações do minerador.
     */
    public constructor(config: HumanMinerConfigurationModel) {
        this.factoryMathProblem = new FactoryMathProblem(config.mathProblem);

        Message.capture(CreateHumanMinerAction, this, this.handlerCreateHumanMinerAction);
        Message.capture(CurrentHumanMinerQuery, this, HumanMiner.handlerCurrentHumanMinerQuery);
    }

    /**
     * Gerador de problemas matemáticos.
     * @private
     */
    private factoryMathProblem: FactoryMathProblem;

    /**
     * Processador de mensagem
     * @param message CreateHumanMinerAction
     * @private
     */
    private handlerCreateHumanMinerAction(message: CreateHumanMinerAction): void {
        const mathProblem = this.factoryMathProblem.generate();
        const message2 = new PutHumanProblemIntoBlockchainAction(mathProblem).request().message;
        message.humanMinerRequest = new HumanMinerRequestModel(message2.problem, message2.url);
    }

    /**
     * Processador de mensagem
     * @param message CurrentHumanMinerQuery
     * @private
     */
    private static handlerCurrentHumanMinerQuery(message: CurrentHumanMinerQuery): void {
        const message2 = new GetHumanProblemFromBlockchainAction().request().message;
        message.humanMinerRequest =
            !message2.problem || message2.problem.isSolved
                ? null
                : new HumanMinerRequestModel(message2.problem, message2.url);
    }
}
