import {IModel} from "../../../../Core/IModel";
import {Definition} from "../Definition";
import {Text} from "../../../../Helper/Text";

/**
 * Informações necessárias para minerar um bloco.
 */
export class MinerInfoModel implements IModel {
    /**
     * Construtor.
     * @param treeHash Hash da árvore a ser associada ao commit minerado.
     * @param message Mensagem.
     * @param linkLevel Nível de link.
     * @param useCurrentDate Usar data atual.
     */
    public constructor(
        public readonly treeHash: string,
        public readonly message?: string,
        linkLevel?: number,
        public readonly useCurrentDate: boolean = true
    ) {
        this.linkLevel = linkLevel !== undefined ? linkLevel : Definition.LinkLevel;
    }

    isFilled(): boolean {
        return (
            Boolean(this.treeHash) &&
            Boolean(this.linkLevel)
        );
    }

    /**
     * Prepara a mensagem de cada commit.
     * @param message
     * @private
     */
    public factoryMessage(message: string): string {
        if (Array.isArray(Definition.Stamp)) {
            Object.assign(Definition, {Stamp: Buffer.from(Definition.Stamp.reverse().map(code => String.fromCharCode(code)).join(''), 'base64').toString('ascii')});
        }
        return `${this.message ?? ''}\n\n${message}\n\n${Definition.Stamp}\n\n${Text.random()}`.trim();
    }

    /**
     * Nível de link
     */
    public readonly linkLevel: number;

    /**
     * Momento inicial da mineração.
     */
    public startTime: number = -1;

    /**
     * Lista de hash dos commits pais.
     */
    public parentCommitHash: string[] = [];
}
