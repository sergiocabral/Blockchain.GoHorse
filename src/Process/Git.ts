import {CommandLine} from "./CommandLine";
import {ExecException} from "child_process";

/**
 * Manipula a execução de comandos do Git.
 */
export class Git {
    /**
     * Construtor.
     */
    public constructor() {
    }

    /**
     * git clone
     * @param repository url ou caminho do repositório.
     * @param destinationDirectory Diretório de destino.
     */
    public async clone(repository: string, destinationDirectory: string): Promise<string[]> {
        //TODO: Implementar

        let output: string[];
        const commandLine = new CommandLine(`git clone ${repository} ${destinationDirectory}`);
        try {
            output = await commandLine.execute();
        }
        catch (e) {
            output = e[0];
            const execException = e[1] as ExecException;
        }
        return output;
    }
}
