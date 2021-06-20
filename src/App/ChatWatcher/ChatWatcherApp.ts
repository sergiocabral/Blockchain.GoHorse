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
import {ChatMessageModel} from "../../Twitch/Model/ChatMessageModel";
import {ReplyFirstMessageChatListener} from "../../Twitch/ChatListener/ReplyFirstMessageChatListener";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {ReplyFirstMessageMode} from "../../Twitch/ChatListener/ReplyFirstMessageMode";

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

        this.userTags = { };
        Object
            .keys(this.environmentApplication.tags)
            .forEach(username =>
                this.userTags[username.toLowerCase()] =
                    this.environmentApplication.tags[username].toLowerCase()
                        .split(/[,;|\s]/)
                        .filter(v => Boolean(v))
                        .sort());

        this.userWatcher = new UserWatcher();
        this.userWatcherReport = new UserWatcherReport(this.environmentApplication.outputFile, this.userTags);
        this.chatBot = new ChatBot(this.environmentApplication.twitchAccount, this.environmentApplication.channels);
        this.chatListenerHandler = new ChatListenerHandler(this.environmentApplication.channels,
            new StreamHolicsChatListener(this.environmentApplication.autoStreamHolicsTerms),
            new ReplyFirstMessageChatListener(this.factoryReplyFirstMessage.bind(this), ReplyFirstMessageMode.PerChannel));
    }

    /**
     * Dados do ambiente para a aplicação.
     * @private
     */
    private get environmentApplication(): ChatWatcherEnvironment {
        return this.environment.application.chatWatcher;
    }

    /**
     * Tags para os usuários.
     * @private
     */
    private readonly userTags: KeyValue<string[]>;

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
     * @private
     */
    private factoryReplyFirstMessage(message: ChatMessageModel): string[] | null {
        const messages = [];

        const all = "*";
        const channel = message.channel.name;
        const username = message.user.name;

        const userTags = this.userTags[username];
        const channels = this.environmentApplication.automaticFirstMessagesForTag;
        const tagGroups = [channels[channel] ?? { }, channels[all] ?? { }];

        for (const tagGroup of tagGroups) {
            for (const tag of Object.keys(tagGroup)) {
                if (tag === all || userTags?.includes(tag)) {
                    messages.push(...tagGroup[tag].map(message => message.querystring({
                        channel: channel,
                        username: username,
                    })));
                }
            }
        }

        return messages;
    }

}
