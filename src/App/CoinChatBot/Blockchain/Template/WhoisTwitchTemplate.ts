import {Template} from "./Template";
import sha1 from "sha1";
import {KeyValue} from "../../../../Helper/Types/KeyValue";

/**
 * Template: WhoisTwitch
 */
export class WhoisTwitchTemplate extends Template {

    /**
     * Construtor.
     * @param name Nome do usuário Twitch
     * @param quote Mensagem de status
     * @param id Id do usuário Twitch
     * @param created Criação do arquivo (ingresso do usuário na blockchain)
     * @param status Qualquer mensagem de status
     */
    public constructor(
        public name?: string,
        public quote?: string,
        public id?: string,
        public created?: string,
        public status?: string) {
        super('WhoisTwitch');
    }

    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        const hashId = Number.isFinite(this.id)
            ? sha1(this.id?.toString() || '')
            : this.id || '';

        let indexPosition = 0;
        return this.set({
            "name": this.name ?? '',
            "quote": this.quote ?? '',
            "created": this.created ?? '',
            "status": this.status ?? '',
            "hash-part-01-length-05": hashId.substring(indexPosition, indexPosition += 5) ?? '',
            "hash-part-02-length-03": hashId.substring(indexPosition, indexPosition += 3) ?? '',
            "hash-part-03-length-02": hashId.substring(indexPosition, indexPosition += 2) ?? '',
            "hash-part-04-length-02": hashId.substring(indexPosition, indexPosition += 2) ?? '',
            "hash-part-05-length-09": hashId.substring(indexPosition, indexPosition += 9) ?? '',
            "hash-part-06-length-08": hashId.substring(indexPosition, indexPosition += 8) ?? '',
            "hash-part-07-length-11": hashId.substring(indexPosition) ?? '',
        });
    }

    /**
     * Lê os parâmetros do conteúdo.
     * @param content Conteúdo do arquivo.
     */
    public override get(content: string): KeyValue {
        const result = super.get(content);
        this.id = result["id"] =
            result["hash-part-01-length-05"] +
            result["hash-part-02-length-03"] +
            result["hash-part-03-length-02"] +
            result["hash-part-04-length-02"] +
            result["hash-part-05-length-09"] +
            result["hash-part-06-length-08"] +
            result["hash-part-07-length-11"];
        return result;
    }
}
