import path from "path";
import fs from "fs";
import {DatabasePath} from "./DatabasePath";
import {VersionTemplate} from "../Template/VersionTemplate";
import {CoinModel} from "../../Model/CoinModel";
import {Definition} from "../Definition";
import {EmptyValueError} from "../../../../Errors/EmptyValueError";
import {IO} from "../../../../Helper/IO";

/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Construtor.
     * @param coin Moeda
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        private coin: CoinModel,
        private readonly directory: string) {
    }

    /**
     * Extensão padrão dos arquivos.
     * @private
     */
    private readonly version: number = 1;

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
     * @param fallback Valor a ser retornado se o arquivo não existir.
     * @param autoCreate Cria o arquivo se não existir.
     * @private
     */
    private read(file: DatabasePath, fallback: (() => string) | string = '', autoCreate: boolean = true): string {
        const realpath = this.ensurePath(file);
        let content: string | undefined;
        if (fs.existsSync(realpath)) {
            content = fs.readFileSync(realpath).toString();
        } else {
            content = typeof(fallback) === 'function' ? fallback() : fallback;
            fs.writeFileSync(realpath, content);
        }
        return content;
    }

    /**
     * Versão da estrutura atual.
     */
    public get structureVersion(): number {
        const versionData = new VersionTemplate(this.coin.name, Definition.MajorVersion, 0);
        const content = this.read("/version", () => versionData.content);
        const values = versionData.get(content);
        const regexMinorVersion = /\d+$/;
        const matchVersion = values["version"].match(regexMinorVersion);
        const version = matchVersion ? Number(matchVersion[0]) : NaN;
        if (Number.isNaN(version)) throw new EmptyValueError("Version not found.");
        return version;
    }

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): boolean {
        const needUpdate = this.structureVersion < this.version;
        if (needUpdate) {

        }
        return needUpdate;
    }

    public writeAnything(): string {
        const file = path.resolve(this.directory, new Date().getTime() + ".txt");
        fs.writeFileSync(file, file);
        return path.basename(file);
    }
}
