/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";
import {ChatBox} from "../Twitch/ChatBox";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";

export class MainApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.environment = new Environment(environment);
        Logger.minLevel = this.environment.logMinLevel;
        this.chatBox = new ChatBox(this.environment);
    }

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    private environment: Environment;

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    private chatBox: ChatBox;

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
}
