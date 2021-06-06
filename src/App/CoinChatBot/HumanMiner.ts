import {Message} from "../../Bus/Message";
import {CreateHumanMinerCommand} from "./MessageCommand/CreateHumanMinerCommand";
import {FactoryMathProblem} from "./FactoryMathProblem";
import {HumanMinerConfigurationModel} from "./Model/HumanMinerConfigurationModel";
import {HumanMinerRequestModel} from "./Model/HumanMinerRequestModel";
import {CurrentHumanMinerQuery} from "./MessageQuery/CurrentHumanMinerQuery";
import {PutHumanProblemIntoBlockchainCommand} from "./MessageCommand/PutHumanProblemIntoBlockchainCommand";
import {GetHumanProblemFromBlockchainCommand} from "./MessageCommand/GetHumanProblemFromBlockchainCommand";

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

        Message.capture(CreateHumanMinerCommand, this, this.handlerCreateHumanMinerCommand);
        Message.capture(CurrentHumanMinerQuery, this, HumanMiner.handlerCurrentHumanMinerQuery);
    }

    /**
     * Gerador de problemas matemáticos.
     * @private
     */
    private factoryMathProblem: FactoryMathProblem;

    /**
     * Processador de mensagem
     * @param message CreateHumanMinerCommand
     * @private
     */
    private handlerCreateHumanMinerCommand(message: CreateHumanMinerCommand): void {
        const mathProblem = this.factoryMathProblem.generate();
        const message2 = new PutHumanProblemIntoBlockchainCommand(mathProblem).request().message;
        message.humanMinerRequest = new HumanMinerRequestModel(message2.problem, message2.url);
    }

    /**
     * Processador de mensagem
     * @param message CurrentHumanMinerQuery
     * @private
     */
    private static handlerCurrentHumanMinerQuery(message: CurrentHumanMinerQuery): void {
        const message2 = new GetHumanProblemFromBlockchainCommand().request().message;
        message.humanMinerRequest =
            !message2.problem || message2.problem.isSolved
                ? null
                : new HumanMinerRequestModel(message2.problem, message2.url);
    }
}
