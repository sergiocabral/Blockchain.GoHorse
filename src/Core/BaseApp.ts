import fs from "fs";
import path from "path";
import {Environment} from "./Environment/Environment";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {Message} from "../Bus/Message";
import {EnvironmentQuery} from "./MessageQuery/EnvironmentQuery";
import {Translate} from "./Translate";
import {InvalidExecutionError} from "../Errors/InvalidExecutionError";
import {IModel} from "./IModel";
import {ApplicationEnvironment} from "./Environment/ApplicationEnvironment";

/**
 * Aplicação: chatbot da Cabr0n Coin.
 */
export abstract class BaseApp {
    /**
     * Construtor.
     * @param applicationName Nome da aplicação.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(applicationName: keyof ApplicationEnvironment, environment: any) {
        this.environment = new Environment(applicationName, environment);
        Message.capture(EnvironmentQuery, this, this.handlerEnvironmentQuery);
        Logger.initialize(this.environment.applicationName, this.environment.log.console.minimumLevel);
        this.loadLanguages();
    }

    /**
     * Dados de configuração do ambiente.
     * @private
     */
    protected readonly environment: Environment;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        Logger.post('Running {0}', this.environment.applicationName, LogLevel.Information, this);

        const environmentApplicationModel = this.environment.application[this.environment.applicationName] as IModel;
        if (!this.environment.isFilled() || !environmentApplicationModel.isFilled()) {
            Logger.post('Environment data is not filled.', undefined, LogLevel.Error, LogContext.BaseApp);
            throw new InvalidExecutionError("Running {0}".querystring(this.environment.applicationName));
        }
    }

    /**
     * Carrega o arquivo de idiomas.
     * @private
     */
    private loadLanguages() {
        const translate = new Translate(this.environment.language, true);
        const content = JSON.parse(fs.readFileSync(path.resolve("src", `translates.${translate.language}.json`)).toString());
        translate.load(content, translate.language);
    }

    /**
     * Processa resposta para mensagem.
     * @param message EnvironmentQuery
     * @private
     */
    private handlerEnvironmentQuery(message: EnvironmentQuery) {
        message.environment = this.environment;
    }
}
