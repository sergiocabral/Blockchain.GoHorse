import path from "path";
import {IO} from "../../../../Helper/IO";
import {Definition} from "../Definition";
import {DatabasePath} from "./DatabasePath";
import fs from "fs";

/**
 * Manipulador de entrada e saída no disco.
 */
export class Persistence {
    /**
     * Construtor.
     * @param directory Diretório do banco de dados.
     */
    public constructor(private readonly directory: string) {
    }

    /**
     * Monta a estrutura do diretório.
     * @param filePath
     * @param values Valores para substituição.
     * @private
     */
    private ensurePath(filePath: string, values?: any): string {
        const parts = filePath.querystring(values).split('/').filter(a => Boolean(a));
        const realpath = path.resolve(this.directory, ...parts);
        const dirname = path.dirname(realpath);
        IO.createDirectory(dirname);
        return `${realpath}.${Definition.FileExtension}`;
    }

    /**
     * Lê o conteúdo de um arquivo.
     * @param file Arquivo.
     * @param content Conteúdo do arquivo.
     * @private
     */
    public write(file: DatabasePath, content: string): void {
        const realpath = this.ensurePath(file);
        fs.writeFileSync(realpath, content);
    }

    /**
     * Lê o conteúdo de um arquivo.
     * @param file Arquivo.
     * @param fallback Valor a ser retornado se o arquivo não existir.
     * @param autoCreate Cria o arquivo se não existir.
     * @private
     */
    public read(file: DatabasePath, fallback: (() => string) | string = '', autoCreate: boolean = true): string {
        const realpath = this.ensurePath(file);
        let content: string | undefined;
        if (fs.existsSync(realpath)) {
            content = fs.readFileSync(realpath).toString();
        } else {
            content = typeof(fallback) === 'function' ? fallback() : fallback;
            if (autoCreate) {
                fs.writeFileSync(realpath, content);
            }
        }
        return content;
    }
}
