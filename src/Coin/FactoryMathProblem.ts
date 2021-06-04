import {MathProblem} from "./Model/MathProblem";
import {Numeric} from "../Helper/Numeric";

/**
 * Gerador de problemas matemáticos.
 */
export class FactoryMathProblem {
    /**
     * Constructor.
     * @param operationCount Total de operações matemáticas.
     * @param minIntegerPart Menor número possível na parte inteira de cada número.
     * @param maxIntegerPart Maior número possível na parte inteira de cada número.
     */
    public constructor(
        public operationCount: number = 10,
        public minIntegerPart: number = 0,
        public maxIntegerPart = 99) {
    }

    /**
     * Gera um problema matemático.
     */
    public generate(): MathProblem {
        let operationCount = this.operationCount;
        let mathProblem = `${this.getRandomNumber()}`;
        while (operationCount-- > 1) {
            mathProblem += ` ${this.getRandomOperation()} ${this.getRandomNumber().toFixed(2)}`;
        }

        const mathProblemResult = eval(mathProblem).toFixed(2);
        const mathProblemResultExpected = Math.floor(Math.abs(mathProblemResult));
        const difference = Number((mathProblemResultExpected - mathProblemResult).toFixed(2));
        if (difference >= 0) mathProblem += ' + ';
        else mathProblem += ' - ';
        mathProblem += Math.abs(difference).toFixed(2);

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
        return Number(`${Numeric.between(this.minIntegerPart, this.maxIntegerPart)}.${Numeric.between(1, 9)}`);
    }
}
