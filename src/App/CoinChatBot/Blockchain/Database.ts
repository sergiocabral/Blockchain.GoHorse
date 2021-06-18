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
     */
    public constructor(private readonly directory: string) {
    }

    /**
     * Versão da estrutura atual.
     */
    public get structureVersion(): number {
        return 0;
    }

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): boolean {
        return false;
    }

    public writeAnything(): string {
        const file = path.resolve(this.directory, new Date().getTime() + ".txt");
        fs.writeFileSync(file, file);
        return path.basename(file);
    }
}
