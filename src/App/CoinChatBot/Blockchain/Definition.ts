/**
 * Definições da blockchain.
 */
export class Definition {
    /**
     * Versão
     */
    public static readonly MajorVersion: number = 0;

    /**
     * Dificuldade da mineração computacional.
     */
    public static readonly ComputerMinerDifficult: number = 4;

    /**
     * Nome do branch que aponta para o primeiro bloco.
     */
    public static readonly FirstBlock: string = "first-block";

    /**
     * Template para o nome do diretório do repositório Git local.
     */
    public static readonly Branch: string = "blockchain-{coin}";

    /**
     * Nível de enlace com commits anteriores.
     */
    public static readonly LinkLevel: number = 10;

    /**
     * Extensão dos arquivos no repositório.
     */
    public static readonly FileExtension: string = "txt";

    /**
     * Estampa.
     */
    public static readonly Stamp: number[] = [61, 48, 50, 98, 106, 53, 67, 98, 104, 74, 110, 89, 104, 78, 50, 98, 112, 100, 109, 99, 108, 78, 72, 73, 53, 74, 71, 73, 107, 86, 71, 99, 118, 120, 87, 90, 50, 86, 71, 90, 103, 81, 109, 98, 104, 66, 67, 90, 108, 53, 50, 90, 112, 78, 88, 90, 107, 66, 121, 99, 104, 100, 72, 73, 117, 108, 50, 98, 68, 66, 105, 98, 119, 73, 110, 89, 104, 78, 69, 73, 108, 104, 71, 86];
}
