import {VersionBase} from "./Version/VersionBase";
import {Version001} from "./Version/Version001";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {CoinModel} from "../../Model/CoinModel";
import path from "path";
import {IO} from "../../../../Helper/IO";
import {Definition} from "../Definition";
import {DatabasePath} from "./DatabasePath";
import fs from "fs";
import {VersionTemplate} from "../Template/VersionTemplate";
import {EmptyValueError} from "../../../../Errors/EmptyValueError";

/**
 * Gerenciador de versões do repositório.
 */
export class Patcher {
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
     * Obtem a instância da versão solicitada.
     * @param version
     */
    public factoryPatcher(version: number): VersionBase {
        switch (version) {
            case 1: return new Version001(this.coin);
        }
        throw new InvalidExecutionError("Invalid version number.");
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
    private write(file: DatabasePath, content: string): void {
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
    private read(file: DatabasePath, fallback: (() => string) | string = '', autoCreate: boolean = true): string {
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

    /**
     * Versão da estrutura atual.
     */
    public getStructureVersion(): number {
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
    public updateStructure(applicationVersion: number): number | boolean {
        let repositoryVersion = this.getStructureVersion();
        if (repositoryVersion > applicationVersion) throw new InvalidExecutionError("The application is outdated in relation to the blockchain.");
        if (repositoryVersion === applicationVersion) return false;
        const versionTemplate = new VersionTemplate(this.coin.name, Definition.MajorVersion, 1);
        do {
            versionTemplate.minorVersion = ++repositoryVersion;
            const patcher = this.factoryPatcher(versionTemplate.minorVersion);
            patcher.apply();
            this.write('/version', versionTemplate.content);
        } while (repositoryVersion < applicationVersion);
        return repositoryVersion;
    }
}
