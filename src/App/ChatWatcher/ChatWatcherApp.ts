import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {BaseApp} from "../../Core/BaseApp";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";
import {ChatListenerHandler} from "../../Twitch/ChatListener/ChatListenerHandler";
import {StreamHolicsChatListener} from "../../Twitch/ChatListener/StreamHolicsChatListener";
import {UserWatcher} from "./UserWatcher/UserWatcher";
import {UserWatcherReport} from "./UserWatcher/UserWatcherReport";
import {ChatMessageModel} from "../../Twitch/Model/ChatMessageModel";
import {ReplyMessageChatListener} from "../../Twitch/ChatListener/ReplyMessageChatListener";
import {ReplyFirstMessageMode} from "../../Twitch/ChatListener/ReplyFirstMessageMode";
import {UserTagsList} from "./UserWatcher/UserTagsList";
import {AutomaticResponseList} from "./UserWatcher/AutomaticResponseList";

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
        this.chatBot = new ChatBot(this.environmentApplication.twitchAccount, this.environmentApplication.channels);
        this.chatListenerHandler = new ChatListenerHandler(this.environmentApplication.channels,
            new StreamHolicsChatListener(this.environmentApplication.autoStreamHolicsTerms),
            new ReplyMessageChatListener(
                this.factoryReplyFirstMessage.bind(this),
                ReplyFirstMessageMode.PerChannel,
                "reset"));
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
     * Gerenciador de captura de comandos do chat
     * @private
     */
    private readonly chatListenerHandler: ChatListenerHandler;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        super.run();

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatWatcher: {message}`, { message: error }, LogLevel.Error, LogContext.ChatWatcherApp));
    }

    /**
     * Constroi a primeira mensagem de resposta para um usuário.
     * @param message Mensagem.
     * @param messageCount Contagem de mensagem para o usuário.
     * @private
     */
    private factoryReplyFirstMessage(message: ChatMessageModel, messageCount: number): string[] | null {
        const messages: string[] = [];
        if (messageCount === 1) {
            messages.push(...this.factoryReplyMessage(this.environmentApplication.firstMessageAutomaticResponseList, message));
        }
        messages.push(...this.factoryReplyMessage(this.environmentApplication.generalMessageAutomaticResponseList, message));
        return messages.unique<string>();
    }

    /**
     * Constroi a primeira mensagem de resposta para um usuário.
     * @param automaticResponseList Lista de respostas automática.
     * @param message Mensagem.
     * @private
     */
    private factoryReplyMessage(automaticResponseList: AutomaticResponseList, message: ChatMessageModel): string[] {
        const channel = message.channel.name;
        const username = message.user.name;
        return automaticResponseList
            .getResponsesToUser(channel, this.userTagsList.getUserTags(username), message.message)
            .map(message => message.querystring({ channel, username }));
    }

}
