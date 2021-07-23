import {BaseSection} from "./BaseSection";
import {VersionTemplate} from "../../Template/VersionTemplate";
import {Definition} from "../../Definition";
import {ShouldNeverHappen} from "../../../../../Errors/ShouldNeverHappen";
import {EmptyValueError} from "../../../../../Errors/EmptyValueError";

/**
 * Seção do banco de dados: Version.
 */
export class VersionSection extends BaseSection {
    /**
     * Define a versão atual.
     */
    public set(applicationVersion: number): void {
        const versionTemplate = new VersionTemplate(this.database.coin.name, Definition.MajorVersion, applicationVersion);
        this.database.persistence.write('/version', undefined, versionTemplate.content, true);
    }

    /**
     * Versão da estrutura atual.
     */
    public get(): number {
        const versionData = new VersionTemplate(this.database.coin.name, Definition.MajorVersion, 0);
        const content = this.database.persistence.read("/version", undefined, () => versionData.content, true);
        if (!content) throw new ShouldNeverHappen();
        const values = versionData.get(content);
        const regexMinorVersion = /\d+$/;
        const matchVersion = values["version"].match(regexMinorVersion);
        const version = matchVersion ? Number(matchVersion[0]) : NaN;
        if (Number.isNaN(version)) throw new EmptyValueError("Version not found.");
        return version;
    }
}
