import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {BaseApp} from "../../Core/BaseApp";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";
import {ChatListenerHandler} from "../../Twitch/ChatListener/ChatListenerHandler";
import {StreamHolicsChatListener} from "../../Twitch/ChatListener/StreamHolicsChatListener";
import {UserWatcher} from "./UserWatcher";
import {UserWatcherReport} from "./UserWatcherReport";

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

        this.userWatcher = new UserWatcher();
        this.userWatcherReport = new UserWatcherReport(this.environmentApplication.outputFile, this.environmentApplication.tags);
        this.chatBot = new ChatBot(this.environmentApplication.twitchAccount, this.environmentApplication.channels);
        this.chatListenerHandler = new ChatListenerHandler(this.environmentApplication.channels,
            new StreamHolicsChatListener(this.environmentApplication.autoStreamHolicsTerms));
    }

    /**
     * Dados do ambiente para a aplicação.
     * @private
     */
    private get environmentApplication(): ChatWatcherEnvironment {
        return this.environment.application.chatWatcher;
    }

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

//    /**
//     * Incrementa a contagem de mensagens do usuário.
//     * @param channelName
//     * @param userName
//     * @private
//     */
//    private incrementMessageCount(channelName: string, userName: string): void {
//        const user = this.getOrAddUser(channelName, userName);
//
//        const firstMessage = user.messageCount++ === 0;
//        if (firstMessage) {
//            Logger.post("Channel: {channel}. First message from user: {username}", {channel: channelName, username: userName}, LogLevel.Debug, LogContext.ChatWatcherApp);
//
//            if (user.tags.length) {
//                const MessageCommands = user.tags.map(tag => {
//                    const tags = this.environmentApplication.automaticFirstMessagesForTag[channelName.toLowerCase()] ?? [];
//                    const messages = tags[tag.toLowerCase()] ?? [];
//                    return messages.map(message => new SendChatMessageCommand(channelName, message.translate().querystring([userName, channelName])));
//                }).flat<SendChatMessageCommand>();
//
//                if (MessageCommands.length) {
//                    MessageCommands.forEach(MessageCommand => MessageCommand.send());
//                    Logger.post(() => 'Answer first message from user "{username}" on channel "{channel}" because of tags: {tags}', {channel: channelName, username: userName, tags: () => user.tags.join(", ")}, LogLevel.Debug, LogContext.ChatWatcherApp);
//                }
//            }
//        }
//        this.saveReport();
//    }

}
