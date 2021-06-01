/**
 * Dados de configuração do ambiente.
 */
export class Environment {

    /**
     * Construtor.
     * @param {?} environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.twitchUserName = environment?.twitchUserName ?? '';
        this.twitchUserToken = environment?.twitchUserToken ?? '';
    }

    /**
     * Usuário da twitch que vai operar o BOT.
     */
    public twitchUserName: string;

    /**
     * Token de autenticação do usuário que vai operar o BOT.
     * Obter em: https://twitchapps.com/tmi/
     */
    public twitchUserToken: string;
}
