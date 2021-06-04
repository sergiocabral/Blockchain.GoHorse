import {MathProblem} from "./Model/MathProblem";
import {Numeric} from "../Helper/Numeric";
import {HumanMinerModel} from "./Model/HumanMinerModel";

/**
 * Gerador de problemas matemáticos.
 */
export class FactoryMathProblem {
    /**
     * Constructor.
     * @param config Configurações da instância.
     */
    public constructor(private config: HumanMinerModel) {
    }

    /**
     * Gera um problema matemático.
     */
    public generate(): MathProblem {
        let operationCount = this.config.operationCount;
        let mathProblem = `${this.getRandomNumber()}`;
        while (operationCount-- > 1) {
            mathProblem += ` ${this.getRandomOperation()} ${this.getRandomNumber().toFixed(this.config.digits)}`;
        }

        const mathProblemResult = eval(mathProblem).toFixed(this.config.digits);
        const mathProblemResultExpected = Math.floor(Math.abs(mathProblemResult));
        const difference = Number((mathProblemResultExpected - mathProblemResult).toFixed(this.config.digits));
        if (difference >= 0) mathProblem += ' + ';
        else mathProblem += ' - ';
        mathProblem += Math.abs(difference).toFixed(this.config.digits);

        return new MathProblem(mathProblem, mathProblemResultExpected);
    }

    /**
     * Operações possíveis.
     * @private
     */
    private readonly operations = [
        '+',
        '-',
        '*',
        '/'
    ];

    /**
     * Obtem uma operação matemática aleatória.
     * @private
     */
    private getRandomOperation(): string {
        return this.operations[Numeric.between(0, this.operations.length - 1)];
    }

    /**
     * Obtem um número aleatória.
     * @private
     */
    private getRandomNumber(): number {
        const integer = Numeric.between(this.config.minIntegerPart, this.config.maxIntegerPart);
        const decimals = ' '.repeat(this.config.digits).split('').map(() => Numeric.between(1, 9)).join('');
        return Number(`${integer}.${decimals}`);
    }
}
