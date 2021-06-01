/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";
import {ChatBox} from "../Twitch/ChatBox";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";

export class MainApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.__environment = new Environment(environment);
        Logger.minLevel = this.__environment.logMinLevel;
        this.__chatBox = new ChatBox(this.__environment);
    }

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    private __environment: Environment;

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    private __chatBox: ChatBox;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        Logger.post('Running.', undefined, LogLevel.Information, this);

        if (!this.__environment.isFilled()) {
            Logger.post('Environment data is not filled.', undefined, LogLevel.Error, this);
            return;
        }

        this.__chatBox.start()
            .catch(error => Logger.post(() => `Error when start the ChatBox: {0}`, error, LogLevel.Error, this));
    }
}
