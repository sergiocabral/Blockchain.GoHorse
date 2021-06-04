import {EmptyValueError} from "../Errors/EmptyValueError";
import {spawnSync, SpawnSyncReturns} from "child_process";

/**
 * Representa a excução de um comando de linha no terminal.
 */
export class CommandLine {
    /**
     * Construtor.
     * @param commandLine Linha de comando que será executada.
     */
    public constructor(public commandLine: string) {
        this.arguments = this.commandLine.split(' ');
        const process = this.arguments.shift();
        if (!process) throw new EmptyValueError('CommandLine process path');
        this.commandLine = process;
    }

    /**
     * Argumentos passado ao processo.
     */
    public arguments: string[];

    /**
     * Informações do processo da última execução.
     * @private
     */
    private lastProcessInfoValue: SpawnSyncReturns<string> | null = null;

    /**
     * Informações do processo da última execução.
     */
    public get lastProcessInfo(): SpawnSyncReturns<string> {
        if (this.lastProcessInfoValue === null)
            throw new EmptyValueError('CommandLine.lastProcessInfo');
        return this.lastProcessInfoValue;
    }

    /**
     * Último erro.
     */
    public get lastError(): Error | null {
        return this.lastProcessInfoValue?.error ?? null;
    }

    /**
     * Executa a linha de comandos.
     * @return Saída do comando.
     */
    public execute(): string[] {
        this.lastProcessInfoValue = null;

        const processInfo = spawnSync(this.commandLine, this.arguments);

        const stdout = processInfo.stdout?.toString() ?? '';
        const stderr = processInfo.stderr?.toString() ?? '';

        const output = (`${stdout}\n${stderr}`.trim())
            .replaceAll("\r\n", "\n")
            .replaceAll("\n\r", "\n")
            .replaceAll("\r", "\n")
            .split("\n");

        this.lastProcessInfoValue = processInfo;
        return output;
    }

    /**
     * Executa a linha de comandos.
     * @return Saída do comando.
     */
    public executeAsync(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            try {
                const output = this.execute();
                resolve(output);
            } catch (error) {
                reject(error);
            }
        });
    }
}
