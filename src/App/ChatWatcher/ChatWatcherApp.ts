import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {BaseApp} from "../../Core/BaseApp";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";
import {UserWatcher} from "./UserWatcher/UserWatcher";
import {UserWatcherReport} from "./UserWatcher/UserWatcherReport";
import {UserTagsList} from "./UserWatcher/UserTagsList";
import {AutomaticResponse} from "./AutomaticResponse/AutomaticResponse";

/**
 * Aplicação: Monitorador do chat.
 */
export class ChatWatcherApp extends BaseApp {
    /**
     * Construtor.
     * @param environment JSON com dados do ambiente.
     */
    public constructor(environment: any) {
        super('chatWatcher', environment);

        this.userTagsList = new UserTagsList(this.environmentApplication.tags);

        this.userWatcher = new UserWatcher();
        this.userWatcherReport = new UserWatcherReport(this.environmentApplication.outputFile, this.userTagsList);
        this.automaticResponse = new AutomaticResponse(this.userTagsList, this.environmentApplication.channels, this.environmentApplication.firstMessageAutomaticResponseList, this.environmentApplication.generalMessageAutomaticResponseList);
        this.chatBot = new ChatBot(this.environmentApplication.twitchAccount, this.environmentApplication.channels);
    }

    /**
     * Dados do ambiente para a aplicação.
     * @private
     */
    private get environmentApplication(): ChatWatcherEnvironment {
        return this.environment.application.chatWatcher;
    }

    /**
     * Dados para tags do usuário.
     * @private
     */
    private readonly userTagsList: UserTagsList;

    /**
     * Cliente ChatBot da Twitch.
     * @private
     */
    private readonly chatBot: ChatBot;

    /**
     * Controle de entrada e saída do canal.
     * @private
     */
    private userWatcher: UserWatcher;

    /**
     * Resposnável pro gravar e enviar o relatório.
     * @private
     */
    private userWatcherReport: UserWatcherReport;

    /**
     * Gerencia a reposta automático ao usuário.
     * @private
     */
    private automaticResponse: AutomaticResponse;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        super.run();

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatWatcher: {message}`, { message: error }, LogLevel.Error, LogContext.ChatWatcherApp));
    }

}
