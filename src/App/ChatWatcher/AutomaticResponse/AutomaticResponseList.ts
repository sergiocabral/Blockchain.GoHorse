import {AutomaticResponseType} from "./AutomaticResponseType";

/**
 * Dados para resposta automática.
 */
export class AutomaticResponseList {

    /**
     * Construtor.
     * @param data Tipo dos dados para resposta automática
     * @param compareTextsFromUserAsSlug Verifica se mensagens do chat correspondem no formato literal (false) ou como slug (true).
     */
    public constructor(
        data: AutomaticResponseType,
        private compareTextsFromUserAsSlug: boolean = true) {
        this.data = this.normalize(data);
    }

    /**
     * Representação de todos os dados.
     */
    public static ALL: string = "*";

    /**
     * Dados de configuração.
     */
    public data: AutomaticResponseType;

    /**
     * Normaliza os dados: sem acentuação, minúscula, etc.
     * @param data
     * @private
     */
    private normalize(data: AutomaticResponseType): AutomaticResponseType {
        const sanitized = { } as AutomaticResponseType;

        for (const channelName of Object.keys(data)) {
            const channelNameSanitized = channelName === AutomaticResponseList.ALL ? channelName : channelName.slug();
            sanitized[channelNameSanitized] = { };

            for (const tagName of Object.keys(data[channelName])) {
                const tagNameSanitized = tagName === AutomaticResponseList.ALL ? tagName : tagName.slug();
                sanitized[channelNameSanitized][tagNameSanitized] = { }

                for (const textFromUser of Object.keys(data[channelName][tagName])) {
                    const textFromUserSanitized = textFromUser === AutomaticResponseList.ALL ? textFromUser :
                        this.compareTextsFromUserAsSlug
                            ? textFromUser.slug()
                            : textFromUser;

                    sanitized[channelNameSanitized][tagNameSanitized][textFromUserSanitized] =
                        data[channelName][tagName][textFromUser];
                }
            }
        }

        return sanitized;
    }

    /**
     * Lista dos canais
     */
    public getChannels(): string[] {
        return Object
            .keys(this.data)
            .sort();
    }

    /**
     * Lista as tags por canal.
     * @param channel Canal.
     */
    public getTags(channel: string): string[] {
        channel = channel.slug();
        return Object
            .keys(Object.assign({},
                this.data[channel] || { },
                this.data[AutomaticResponseList.ALL] || { }))
            .sort();
    }

    /**
     * Lista as tags por canal.
     * @param channel Canal.
     * @param tag Tag
     */
    public getTextsFromUser(channel: string, tag: string): string[] {
        channel = channel.slug();
        tag = tag.slug();
        return Object
            .keys(Object.assign({},
                (this.data[channel] || { })[tag] || { },
                (this.data[AutomaticResponseList.ALL] || { })[tag] || { },
                (this.data[channel] || { })[AutomaticResponseList.ALL] || { },
                (this.data[AutomaticResponseList.ALL] || { })[AutomaticResponseList.ALL] || { },
            ));
    }

    /**
     * Lista as tags por canal.
     * @param channel Canal.
     * @param tags Tags
     * @param textFromUser Texto recebido.
     */
    public getResponsesToUser(channel: string, tags: string[], textFromUser: string): string[] {
        const result: string[] = [];
        channel = channel.slug();
        textFromUser = this.compareTextsFromUserAsSlug ? textFromUser.slug() : textFromUser;
        tags
            .map(tag => tag.slug())
            .concat([AutomaticResponseList.ALL])
            .unique<string>()
            .forEach(tag => result.push(...([] as string[]).concat(
                ((this.data[channel] || { })[tag] || { })[textFromUser] || [],
                ((this.data[channel] || { })[tag] || { })[AutomaticResponseList.ALL] || [],
                ((this.data[AutomaticResponseList.ALL] || { })[tag] || { })[textFromUser] || [],
                ((this.data[AutomaticResponseList.ALL] || { })[tag] || { })[AutomaticResponseList.ALL] || []
            )));

        return result.unique<string>();
    }

}
