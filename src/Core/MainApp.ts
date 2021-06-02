import {Environment} from "../Data/Environment";
import {ChatBox} from "../Twitch/ChatBox";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {ChatCoin} from "../Coin/ChatCoin";
import {Message} from "../Bus/Message";
import {EnvironmentQuery} from "./MessageQuery/EnvironmentQuery";

/**
 * Classe principal do sistema.
 */
export class MainApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.environment = new Environment(environment);
        Logger.minLevel = this.environment.logMinLevel;

        Message.capture(EnvironmentQuery, this, this.onEnvironmentQuery);

        this.chatBox = new ChatBox();
        this.chatCoin = new ChatCoin();
    }

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    private readonly environment: Environment;

    /**
     * Cliente ChatBox da Twitch.
     * @private
     */
    private readonly chatBox: ChatBox;

    /**
     * Escuta do chat da moeda.
     * @private
     */
    private readonly chatCoin: ChatCoin;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        Logger.post('Running.', undefined, LogLevel.Information, this);

        if (!this.environment.isFilled()) {
            Logger.post('Environment data is not filled.', undefined, LogLevel.Error, LogContext.MainApp);
            return;
        }

        this.chatBox.start()
            .catch(error => Logger.post(() => `Error when start the ChatBox: {0}`, error, LogLevel.Error, LogContext.MainApp));
    }

    /**
     * Processa resposta para mensagem.
     * @param message EnvironmentQuery
     * @private
     */
    private onEnvironmentQuery(message: EnvironmentQuery) {
        message.environment = this.environment;
    }
}
