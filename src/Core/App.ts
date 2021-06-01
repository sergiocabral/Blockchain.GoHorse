/**
 * Classe principal do sistema.
 */
import {Environment} from "../Data/Environment";

export class App {

    /**
     * Construtor.
     * @param {?} environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.__environment = new Environment(environment);
    }

    private __environment: Environment;

    /**
     * Inicia a aplicação.
     */
    public run() {
        console.log('WOW!', this.__environment.twitchUserName);
    }
}
