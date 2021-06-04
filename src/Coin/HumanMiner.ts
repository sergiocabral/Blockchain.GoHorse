import {Message} from "../Bus/Message";
import {ConfigureHumanMinerCommand} from "./MessageCommand/ConfigureHumanMinerCommand";
import {FactoryMathProblem} from "./FactoryMathProblem";
import {HumanMinerModel} from "./Model/HumanMinerModel";

/**
 * Minerador humano.
 */
export class HumanMiner {
    /**
     * Constructor.
     * @param config Configurações do minerador.
     */
    public constructor(config: HumanMinerModel) {
        this.factoryMathProblem = new FactoryMathProblem(config);

        Message.capture(ConfigureHumanMinerCommand, this, this.handlerConfigureHumanMinerCommand);
    }

    /**
     * Gerador de problemas matemáticos.
     * @private
     */
    private factoryMathProblem: FactoryMathProblem;

    /**
     * Processador de mensagem
     * @param message ConfigureHumanMinerCommand
     * @private
     */
    private handlerConfigureHumanMinerCommand(message: ConfigureHumanMinerCommand): void {
        message.mathProblem = this.factoryMathProblem.generate();
    }
}
