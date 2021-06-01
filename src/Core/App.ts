/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";
import {ChatBox} from "../Twitch/ChatBox";
import {Logger} from "../Log/Logger";
import {Level} from "../Log/Level";

export class App {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.__environment = new Environment(environment);
        Logger.minLevel = this.__environment.logMinLevel;
        this.__chatBox = new ChatBox(this.__environment);

        Logger.post('Created.', Level.Verbose, 'App');
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
        if (!this.__environment.isFilled()) {
            Logger.post('Environment data is not filled.', Level.Error, 'App');
            return;
        }

        Logger.post('Starting ChatBox.', Level.Verbose, 'App');
        this.__chatBox.start().then(() => Logger.post('ChatBox started.', Level.Verbose, 'App'));
    }
}
