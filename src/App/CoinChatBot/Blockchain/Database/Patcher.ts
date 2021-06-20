import {VersionBase} from "./Version/VersionBase";
import {Version001} from "./Version/Version001";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {CoinModel} from "../../Model/CoinModel";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";

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
     * Cria a estrutura inicial
     * @param structureVersion Versão da estrutura de arquivos.
     * @param applicationVersion Versão da aplicação.
     */
    public updateStructure(structureVersion: number, applicationVersion: number): number | boolean {
        if (structureVersion > applicationVersion) {
            throw new InvalidExecutionError("The application is outdated in relation to the blockchain.");
        }
        if (structureVersion === applicationVersion) {
            return false;
        }
        do {
            const patcher = this.factoryPatcher(++structureVersion);
            patcher.apply();
        } while (structureVersion < applicationVersion);
        return structureVersion;
    }
}
