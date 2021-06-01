/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";

export class App {

    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.__environment = new Environment(environment);
    }

    private __environment: Environment;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        if (!this.__environment.isFilled()) {
            console.error('Environment data is not filled.');
            return;
        }
        console.log('WOW!', this.__environment.chatBoxAuthentication.username);
    }
}
