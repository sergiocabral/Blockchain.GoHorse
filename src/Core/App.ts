/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";
import {ChatBox} from "../Twitch/ChatBox";

export class App {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.__environment = new Environment(environment);
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
    public async run(): Promise<void> {
        if (!this.__environment.isFilled()) {
            console.error('Environment data is not filled.');
            return;
        }
        await this.__chatBox.start();
    }
}
