import {Client, Options} from 'tmi.js'
import {Environment} from "../Data/Environment";
import {Logger} from "../Log/Logger";
import {Level} from "../Log/Level";

/**
 * Cliente ChatBox da Twitch
 */
export class ChatBox {
    /**
     * Construtor.
     * @param environment Informação de configuração do ambiente.
     */
    public constructor(environment: Environment) {
        this.__options = ChatBox.factoryClientOptions(environment);
        this.__client = new Client(this.__options);
    }

    /**
     * Client IRC da Twitch.
     * @private
     */
    private __client: Client;

    /**
     * opções de conexão.
     * @private
     */
    private __options: Options;

    /**
     * Monta o objeto com informações para conexão do chatbox.
     * @param environment Informação de configuração do ambiente.
     * @private
     */
    private static factoryClientOptions(environment: Environment): Options {
        return {
            options: {
                clientId: environment.applicationName,
                debug: !environment.isProduction,
                messagesLogLevel: environment.isProduction ? "info" : "debug",
            },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username: environment.chatBoxAuthentication.username,
                password: environment.chatBoxAuthentication.token,
            },
            channels: environment.chatBoxAuthentication.channels,
            logger: Object.assign({
                info: (message: string) => Logger.post(message, undefined, Level.Information, 'TMI'),
                warn: (message: string) => Logger.post(message, undefined, Level.Warning, 'TMI'),
                error: (message: string) => Logger.post(message, undefined, Level.Error, 'TMI'),
            }, {
                debug: (message: string) => Logger.post(message, undefined, Level.Debug, 'TMI')
            }),
        };
    }

    /**
     * Estabelece a conexão.
     */
    public async start(): Promise<void> {
        Logger.post('Connecting.', undefined, Level.Verbose, 'ChatBox');
        await this.__client.connect();
        if (this.__options.channels) {
            for (const channel of this.__options.channels) {
                Logger.post('Sending welcome message.', undefined, Level.Verbose, 'ChatBox');
                await this.__client.say(channel, 'Hi');
            }
        }
    }
}
