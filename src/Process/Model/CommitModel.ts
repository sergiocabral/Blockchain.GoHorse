import {IModel} from "../../Core/IModel";

/**
 * Informações sobre um commit.
 */
export class CommitModel implements IModel {
    /**
     * Construtor.
     * @param hash Hash do commitContent.
     * @param commitContent Texto do commitContent.
     */
    public constructor(public readonly hash: string, public readonly commitContent: string) {
        this.treeHash = (/(?<=tree )[0-9a-f]{40}/.exec(commitContent) as any)[0];
        this.authorName = (/(?<=author )[^<]+(?=\s)/.exec(commitContent) as any)[0];
        this.authorEmail = (/(?<=author.*?<)[^>]+/.exec(commitContent) as any)[0];
        this.authorDate = (/(?<=author.*?>\s)[\d \-+]+/.exec(commitContent) as any)[0];
        this.committerName = (/(?<=committer )[^<]+(?=\s)/.exec(commitContent) as any)[0];
        this.committerEmail = (/(?<=committer.*?<)[^>]+/.exec(commitContent) as any)[0];
        this.committerDate = (/(?<=committer.*?>\s)[\d \-+]+/.exec(commitContent) as any)[0];
        this.message = commitContent.substr(commitContent.indexOf("\n\n") + 2);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.hash) &&
            Boolean(this.treeHash) &&
            Boolean(this.authorName) &&
            Boolean(this.authorEmail) &&
            Boolean(this.authorDate) &&
            Boolean(this.committerName) &&
            Boolean(this.committerEmail) &&
            Boolean(this.committerDate)
        );
    }

    /**
     * Hash da árvore.
     */
    public readonly treeHash: string;

    /**
     * Autor: nome
     */
    public readonly authorName: string;

    /**
     * Autor: email
     */
    public readonly authorEmail: string;

    /**
     * Autor: data
     */
    public readonly authorDate: string;

    /**
     * Comitador: nome
     */
    public readonly committerName: string;

    /**
     * Comitador: email
     */
    public readonly committerEmail: string;

    /**
     * Comitador: data
     */
    public readonly committerDate: string;

    /**
     * Mensagem
     */
    public message: string;
}
