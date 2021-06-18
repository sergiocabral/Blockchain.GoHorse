import path from "path";
import fs from "fs";
import {CoinModel} from "../../Model/CoinModel";
import {Patcher} from "./Patcher";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";

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
     * @param firstBlock Informações do primeiro bloco.
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        private readonly coin: CoinModel,
        public readonly firstBlock: CommitModel,
        private readonly directory: string) {
        this.persister = new Persistence(directory);
        this.patcher = new Patcher(this.persister, firstBlock, coin);
    }

    /**
     * Manipulador de entrada e saída no disco.
     * @private
     */
    private persister: Persistence;

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
