import {exec, ExecException} from "child_process";

/**
 * Representa a excução de um comando de linha no terminal.
 */
export class CommandLine {
    /**
     * Construtor.
     * @param commandLine Linha de comando que será executada.
     */
    public constructor(public commandLine: string) {
    }

    /**
     * Executa a linha de comandos.
     * @return Saída do comando.
     */
    public execute(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            exec(this.commandLine, (error: ExecException | null, stdout: string, stderror: string) => {
                const output = (stdout + '\n' + stderror)
                    .replaceAll("\r\n", "\n")
                    .replaceAll("\n\r", "\n")
                    .replaceAll("\r", "\n")
                    .split("\n");
                if (error === null) resolve(output);
                else reject([output, error]);
            })
        });
    }
}
