import {EmptyValueError} from "../Errors/EmptyValueError";
import {spawnSync, SpawnSyncReturns} from "child_process";
import {chdir} from "process";

/**
 * Representa a excução de um comando de linha no terminal.
 */
export class CommandLine {
    /**
     * Construtor.
     * @param processName Nome do processo.
     * @param processArguments Argumentos de linha de comando
     * @param initialDirectory Diretório inicial.
     */
    public constructor(public processName: string, public processArguments: string[] = [], public initialDirectory?: string) {
    }

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
     * Prepara o ambiente para a executa de um processo git.
     * @private
     */
    private prepare(): void {
        if (this.initialDirectory) chdir(this.initialDirectory);
    }

    /**
     * Executa a linha de comandos.
     * @return Saída do comando.
     */
    public execute(): string[] {
        this.lastProcessInfoValue = null;

        this.prepare();
        const processInfo = spawnSync(this.processName, this.processArguments);

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
