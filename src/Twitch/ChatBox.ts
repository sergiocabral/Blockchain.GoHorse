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
        const clientOptions = ChatBox.factoryClientOptions(environment);
        this.__client = new Client(clientOptions);
    }

    /**
     * Client IRC da Twitch.
     * @private
     */
    private __client: Client;

    /**
     * Monta o objeto com informações para conexão do chatbox.
     * @param environment Informação de configuração do ambiente.
     * @private
     */
    private static factoryClientOptions(environment: Environment): Options {
        return {
            options: {
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
            logger: {
                info: message => Logger.post(message, Level.Information, 'TMI'),
                warn: message => Logger.post(message, Level.Warning, 'TMI'),
                error: message => Logger.post(message, Level.Error, 'TMI'),
            },
        };
    }

    /**
     * Estabelece a conexão.
     */
    public async start(): Promise<void> {
        Logger.post('Connecting.', Level.Verbose, 'ChatBox');
        await this.__client.connect();
    }
}
