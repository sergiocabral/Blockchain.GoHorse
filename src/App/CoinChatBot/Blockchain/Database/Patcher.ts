import {VersionBase} from "./Version/VersionBase";
import {Version001} from "./Version/Version001";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {CoinModel} from "../../Model/CoinModel";
import {Definition} from "../Definition";
import {VersionTemplate} from "../Template/VersionTemplate";
import {EmptyValueError} from "../../../../Errors/EmptyValueError";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";
import {ShouldNeverHappen} from "../../../../Errors/ShouldNeverHappen";

/**
 * Gerenciador de versões do repositório.
 */
export class Patcher {
    /**
     * Construtor.
     * @param coin Moeda
     * @param firstBlock Informações do primeiro bloco.
     * @param persistence Manipulador de entrada e saída no disco.
     */
    public constructor(
        private readonly persistence: Persistence,
        public readonly firstBlock: CommitModel,
        private readonly coin: CoinModel) {
    }

    /**
     * Obtem a instância da versão solicitada.
     * @param version
     */
    public factoryPatcher(version: number): VersionBase {
        switch (version) {
            case 1: return new Version001(this.persistence, this.firstBlock, this.coin);
        }
        throw new InvalidExecutionError("Invalid version number.");
    }

    /**
     * Versão da estrutura atual.
     */
    public getStructureVersion(): number {
        const versionData = new VersionTemplate(this.coin.name, Definition.MajorVersion, 0);
        const content = this.persistence.read("/version", undefined, () => versionData.content, true);
        if (!content) throw new ShouldNeverHappen();
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
            this.persistence.write('/version', undefined, versionTemplate.content, true);
        } while (repositoryVersion < applicationVersion);
        return repositoryVersion;
    }
}
