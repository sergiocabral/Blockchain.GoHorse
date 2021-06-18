import path from "path";
import fs from "fs";
import {CoinModel} from "../../Model/CoinModel";
import {Patcher} from "./Patcher";

/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Extensão padrão dos arquivos.
     * @private
     */
    private readonly version: number = 1;

    /**
     * Construtor.
     * @param coin Moeda
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        private coin: CoinModel,
        private readonly directory: string) {
        this.patcher = new Patcher(coin, directory);
    }

    /**
     * Gerenciador de versões do repositório.
     * @private
     */
    private patcher: Patcher;

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): number | boolean {
        return this.patcher.updateStructure(this.version);
    }

    public writeAnything(): string {
        const file = path.resolve(this.directory, new Date().getTime() + ".txt");
        fs.writeFileSync(file, file);
        return path.basename(file);
    }
}
