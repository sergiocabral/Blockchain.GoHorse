import path from "path";
import fs from "fs";

/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Construtor.
     * @param directory Diretório do banco de dados.
     * @param commitTransaction Função que faz as alterações atuais entrar no bloco.
     */
    public constructor(
        private readonly directory: string,
        private readonly commitTransaction: Function) {
        this.initialize();
    }

    /**
     * Inicializa o banco de dados.
     */
    public initialize() {
        const file = path.resolve(this.directory, new Date().getTime() + ".txt");
        fs.writeFileSync(file, file);
        this.commitTransaction();
    }
}
