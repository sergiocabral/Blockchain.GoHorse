import path from "path";
import fs from "fs";
import {Text} from "../../../Helper/Text";

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
        private readonly commitTransaction: (message: string) => void) {
        this.initialize();
    }

    /**
     * Inicializa o banco de dados.
     */
    public initialize() {
        for (let i = 0; i < 5; i++) {
            const file = path.resolve(this.directory, new Date().getTime() + ".txt");
            fs.writeFileSync(file, file);
            this.commitTransaction("Teste de bloco {0}/{1} aleatório {2}".querystring([i + 1, 5, Text.random()]));
        }
    }
}
