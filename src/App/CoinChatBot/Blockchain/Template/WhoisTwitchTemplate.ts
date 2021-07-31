import {Template} from "./Template";

/**
 * Template: WhoisTwitch
 */
export class WhoisTwitchTemplate extends Template {

    /**
     * Construtor.
     * @param twitchName Nome do usuário
     * @param twitchGuid Código Guid
     * @param twitchId Código numérico
     */
    public constructor(
        public twitchName?: string,
        public twitchGuid?: string,
        public twitchId?: string) {
        super('WhoisTwitch');
    }

    /**
     * Conteúdo do arquivo.
     */
    public get content(): string {
        return this.set({
            "twitch-name": this.twitchName ?? '',
            "twitch-guid": this.twitchGuid ?? '',
            "twitch-id": this.twitchId ?? ''
        });
    }

}
