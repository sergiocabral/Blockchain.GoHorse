import {CommandLine} from "./CommandLine";

/**
 * Manipula a execução de comandos do Git.
 */
export class Git {
    /**
     * Construtor.
     * @param initialDirectory Diretório inicial.
     */
    public constructor(public initialDirectory: string) {
        this.gitCommandLine = new CommandLine('git', [], initialDirectory);
    }

    /**
     * Determina se o Git está instalado.
     * @private
     */
    private static isInstalledValue: boolean | null = null;

    /**
     * Determina se o Git está instalado.
     */
    public static get isInstalled(): boolean {
        if (this.isInstalledValue === null) {
            try {
                const output = (new CommandLine('git', ['--version']).execute()).join('\n');
                this.isInstalledValue = /^git/.test(output);
            } catch (error) {
                this.isInstalledValue = false;
            }
        }
        return this.isInstalledValue;
    }

    /**
     * Linha de comando para execução do Git.
     * @private
     */
    private gitCommandLine: CommandLine;

    /**
     * git clone
     * @param repository url ou caminho do repositório.
     * @param destinationDirectory Diretório de destino.
     * @param changeDirectoryToRepositry Após o clone muda o diretório atual para o do repositório clonado.
     */
    public clone(repository: string, destinationDirectory: string, changeDirectoryToRepositry: boolean = true): string[] {
        this.gitCommandLine.processArguments = [
            'clone',
            repository,
            destinationDirectory
        ];
        return this.gitCommandLine.execute();
    }
}
