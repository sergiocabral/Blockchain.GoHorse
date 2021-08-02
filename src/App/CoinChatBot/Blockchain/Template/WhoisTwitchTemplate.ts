import {Template} from "./Template";
import sha1 from "sha1";
import {KeyValue} from "../../../../Helper/Types/KeyValue";
import {Persistence} from "../Database/Persistence";

/**
 * Template: WhoisTwitch
 */
export class WhoisTwitchTemplate extends Template {

    /**
     * Construtor.
     * @param name Nome do usuário Twitch
     * @param quote Mensagem de status
     * @param id Id do usuário Twitch
     * @param updated Criação do arquivo (ingresso do usuário na blockchain)
     * @param status Qualquer mensagem de status
     */
    public constructor(
        public name?: string,
        public quote?: string,
        public id?: string,
        public updated?: Date,
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
            "updated": this.updated ? Persistence.dateToText(this.updated) : '',
            "status": this.status ?? '',
            "hash-part-01-length-03": hashId.substring(indexPosition, indexPosition += 3) ?? '',
            "hash-part-02-length-03": hashId.substring(indexPosition, indexPosition += 3) ?? '',
            "hash-part-03-length-03": hashId.substring(indexPosition, indexPosition += 3) ?? '',
            "hash-part-04-length-03": hashId.substring(indexPosition, indexPosition += 3) ?? '',
            "hash-part-05-length-09": hashId.substring(indexPosition, indexPosition += 9) ?? '',
            "hash-part-06-length-09": hashId.substring(indexPosition, indexPosition += 9) ?? '',
            "hash-part-07-length-10": hashId.substring(indexPosition) ?? '',
        });
    }

    /**
     * Lê os parâmetros do conteúdo.
     * @param content Conteúdo do arquivo.
     * @param writeValues Escreve os valores lidos na instâncias
     */
    public override get(content: string, writeValues: boolean = false): KeyValue {
        const result = super.get(content, writeValues);
        result["id"] =
            result["hash-part-01-length-03"] +
            result["hash-part-02-length-03"] +
            result["hash-part-03-length-03"] +
            result["hash-part-04-length-03"] +
            result["hash-part-05-length-09"] +
            result["hash-part-06-length-09"] +
            result["hash-part-07-length-10"];
        if (writeValues) {
            this.id = result["id"];
            this.updated = Persistence.textToDate(result["updated"]);
        }
        return result;
    }
}
