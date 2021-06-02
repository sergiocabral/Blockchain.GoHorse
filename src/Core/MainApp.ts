import fs from "fs";
import path from "path";
import {Environment} from "./Environment";
import {ChatBox} from "../Twitch/ChatBox";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {ChatCoin} from "../Coin/ChatCoin";
import {Message} from "../Bus/Message";
import {EnvironmentQuery} from "./MessageQuery/EnvironmentQuery";
import {Translate} from "./Translate";

/**
 * Classe principal do sistema.
 */
export class MainApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        this.environment = new Environment(environment);
        Logger.minLevel = this.environment.logMinLevel;

        this.loadLanguages();

        Message.capture(EnvironmentQuery, this, this.onEnvironmentQuery);

        this.chatBox = new ChatBox();
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
    private readonly chatBox: ChatBox;

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

        this.chatBox.start()
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
    private onEnvironmentQuery(message: EnvironmentQuery) {
        message.environment = this.environment;
    }
}
