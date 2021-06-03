import fs from "fs";
import path from "path";
import {Environment} from "./Environment";
import {ChatBot} from "../Twitch/ChatBot";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {ChatCoin} from "../Coin/ChatCoin";
import {Message} from "../Bus/Message";
import {EnvironmentQuery} from "./MessageQuery/EnvironmentQuery";
import {Translate} from "./Translate";
import {ConsoleLogger} from "../Log/ConsoleLogger";

/**
 * Classe principal do sistema.
 */
export class App {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.environment = new Environment(environment);

        Logger.minimumLevel = this.environment.log.minimumLevel;
        ConsoleLogger.minimumLevel = this.environment.log.console.minimumLevel;

        this.loadLanguages();

        Message.capture(EnvironmentQuery, this, this.handlerEnvironmentQuery);

        this.chatBot = new ChatBot();
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
    private readonly chatBot: ChatBot;

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

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatBox: {0}`, error, LogLevel.Error, LogContext.MainApp));
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
