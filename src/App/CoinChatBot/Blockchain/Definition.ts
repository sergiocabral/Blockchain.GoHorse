/**
 * Definições da blockchain.
 */
export class Definition {
    /**
     * Template para um branch vazio.
     */
    public static readonly EmptyBranchName: string = "first-block";

    /**
     * Template para o nome do diretório do repositório Git local.
     */
    public static readonly BranchName: string = "blockchain-{coin}";
}
