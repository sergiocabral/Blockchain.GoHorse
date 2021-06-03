import {IModel} from "../IModel";
import {PersistenceLogModel} from "../../Log/Model/PersistenceLogModel";
import {ApplicationEnvironment} from "./ApplicationEnvironment";

/**
 * Informação de configuração do ambiente.
 */
export class Environment implements IModel {
    /**
     * Construtor.
     * @param applicationName Nome da aplicação.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(
        public readonly applicationName: keyof ApplicationEnvironment,
        environment: any) {
        this.environment = environment?.environment ?? '';
        this.language = environment?.language ?? '';
        this.log = new PersistenceLogModel(environment.log);
        this.application = new ApplicationEnvironment(environment?.application);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            Boolean(this.environment) &&
            Boolean(this.language) &&
            this.log.isFilled()
        );
    }

    /**
     * Tipo de ambiente.
     */
    public readonly environment: string;

    /**
     * Idioma.
     */
    public readonly language: string;

    /**
     * Determina se o ambiente atual é de produção.
     */
    public get isProduction(): boolean {
        return this.environment === "production";
    }

    /**
     * Persistência de log.
     */
    public readonly log: PersistenceLogModel;

    /**
     * Aplicações
     */
    public readonly application: ApplicationEnvironment;
}
