import {CommandLine} from "./CommandLine";
import {ExecException} from "child_process";

/**
 * Manipula a execução de comandos do Git.
 */
export class Git {
    /**
     * Construtor.
     * @param initialDirectory Diretório inicial.
     */
    public constructor(private initialDirectory: string) {
    }

    /**
     * Determina se o Git está instalado.
     */
    public static get isInstalled(): boolean {
        try {
            const output = (new CommandLine('git --version').execute()).join('\n');
            return /^git/.test(output);
        } catch (error){
            return false;
        }
    }

    /**
     * git clone
     * @param repository url ou caminho do repositório.
     * @param destinationDirectory Diretório de destino.
     * @param changeDirectoryToRepositry Após o clone muda o diretório atual para o do repositório clonado.
     */
    public async clone(repository: string, destinationDirectory: string, changeDirectoryToRepositry: boolean = true): Promise<string[]> {
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
