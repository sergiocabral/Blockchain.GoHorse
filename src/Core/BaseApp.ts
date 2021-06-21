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
import {DateTimeFormat} from "../Helper/DateTimeFormat";
import {NumericFormat} from "../Helper/NumericFormat";
import Timeout = NodeJS.Timeout;
import {ClockEvent} from "./MessageEvent/ClockEvent";

/**
 * Aplicação: chatbot da Cabr0n Coin.
 */
export abstract class BaseApp {
    /**
     * Construtor.
     * @param applicationName Nome da aplicação.
     * @param environment JSON com dados do ambiente.
     */
    protected constructor(applicationName: keyof ApplicationEnvironment, environment: any) {
        this.environment = new Environment(applicationName, environment);
        Message.capture(EnvironmentQuery, this.handlerEnvironmentQuery.bind(this));
        Logger.initialize(this.environment.applicationName, this.environment.log);
        this.loadLocaleData();
        this.clockStart();
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
        Logger.post('Running {applicationName}', { applicationName: this.environment.applicationName }, LogLevel.Information, this);

        const environmentApplicationModel = this.environment.application[this.environment.applicationName] as IModel;
        if (!this.environment.isFilled() || !environmentApplicationModel.isFilled()) {
            Logger.post('Environment data is not filled.', undefined, LogLevel.Error, LogContext.BaseApp);
            throw new InvalidExecutionError("Running {0}".querystring(this.environment.applicationName));
        }
    }

    /**
     * Carrega informações regionais.
     * @private
     */
    private loadLocaleData() {
        const translateService = new Translate(this.environment.language, true);
        const translatesContent = JSON.parse(fs.readFileSync(path.resolve("src", `translates.${translateService.language}.json`)).toString());
        translateService.load(translatesContent, translateService.language);

        const localeContent = JSON.parse(fs.readFileSync(path.resolve("src", `locale.${translateService.language}.json`)).toString());
        NumericFormat.defaults(localeContent['numeric']);
        DateTimeFormat.defaults(localeContent['datetime']);
    }

    /**
     * Processa resposta para mensagem.
     * @param message EnvironmentQuery
     * @private
     */
    private handlerEnvironmentQuery(message: EnvironmentQuery) {
        message.environment = this.environment;
    }

    /**
     * Intervalo do sistema.
     * @private
     */
    private clockInterval: Timeout | null = null;

    /**
     * Inicia o clock do sistema.
     * @private
     */
    private clockStart(): void {
        if (this.clockInterval !== null) {
            clearInterval(this.clockInterval);
            ClockEvent.pulsesInSeconds = 0;
        }
        const oneSecond = 1000;
        this.clockInterval = setInterval(BaseApp.clockEmitter, oneSecond);
    }

    /**
     * Dispara o pulso do clock.
     * @private
     */
    private static clockEmitter(): void {
        new ClockEvent(++ClockEvent.pulsesInSeconds).send();
    }
}
