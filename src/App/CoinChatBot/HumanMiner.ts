import {Message} from "../../Bus/Message";
import {CreateHumanMinerCommand} from "./MessageCommand/CreateHumanMinerCommand";
import {FactoryMathProblem} from "./FactoryMathProblem";
import {HumanMinerConfigurationModel} from "./Model/HumanMinerConfigurationModel";
import {HumanMinerRequestModel} from "./Model/HumanMinerRequestModel";
import {CurrentHumanMinerQuery} from "./MessageQuery/CurrentHumanMinerQuery";

/**
 * Minerador humano.
 */
export class HumanMiner {
    /**
     * Constructor.
     * @param config Configurações do minerador.
     */
    public constructor(config: HumanMinerConfigurationModel) {
        this.factoryMathProblem = new FactoryMathProblem(config);

        Message.capture(CreateHumanMinerCommand, this, this.handlerCreateHumanMinerCommand);
        Message.capture(CurrentHumanMinerQuery, this, this.handlerCurrentHumanMinerQuery);
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
        message.humanMinerRequest = new HumanMinerRequestModel(mathProblem);
        //TODO: Registrar na blockchain.
    }

    /**
     * Processador de mensagem
     * @param message CurrentHumanMinerQuery
     * @private
     */
    private handlerCurrentHumanMinerQuery(message: CurrentHumanMinerQuery): void {
        message.humanMinerRequest = null;
        //TODO: Consultar na blockchain.
    }
}
