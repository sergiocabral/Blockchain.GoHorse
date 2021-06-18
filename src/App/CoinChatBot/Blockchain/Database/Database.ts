import path from "path";
import fs from "fs";
import {DatabasePath} from "./DatabasePath";
import {VersionTemplate} from "../Template/VersionTemplate";
import {CoinModel} from "../../Model/CoinModel";
import {Definition} from "../Definition";
import {EmptyValueError} from "../../../../Errors/EmptyValueError";

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
     * Lê o conteúdo de um arquivo.
     * @param file Arquivo.
     * @param fallback Valor a ser retornado se o arquivo não existir.
     * @param autoCreate Cria o arquivo se não existir.
     * @private
     */
    private read(file: DatabasePath, fallback: (() => string) | string = '', autoCreate: boolean = true): string {
        fallback = typeof(fallback) === 'function' ? fallback() : fallback;
        switch (file) {
            case "/version":
        }
        return fallback;
    }

    /**
     * Versão da estrutura atual.
     */
    public get structureVersion(): number {
        const versionData = new VersionTemplate(this.coin.name, `Version ${Definition.MajorVersion}.${this.version}`);
        const content = this.read("/version", () => versionData.content);
        const values = versionData.get(content);
        const regexMinorVersion = /\d+$/;
        const versionText = values["version"].match(regexMinorVersion);
        const version = versionText? Number(versionText[0]) : NaN;
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
