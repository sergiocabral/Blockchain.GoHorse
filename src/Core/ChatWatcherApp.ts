import {ChatBot} from "../Twitch/ChatBot";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {BaseApp} from "./BaseApp";
import {Message} from "../Bus/Message";
import {ChatJoinEvent} from "../Twitch/MessageEvent/ChatJoinEvent";
import {ChatPartEvent} from "../Twitch/MessageEvent/ChatPartEvent";
import {KeyValue} from "../Helper/Types/KeyValue";
import {ChatJoinPartModel} from "../Twitch/Model/ChatJoinPartModel";
import {ChatWatcherEnvironment} from "./Environment/ChatWatcherEnvironment";

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

        Message.capture(ChatJoinEvent, this, this.handlerChatJoinEvent);
        Message.capture(ChatPartEvent, this, this.handlerChatPartEvent);

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
     * Cliente ChatBot da Twitch.
     * @private
     */
    private readonly chatBot: ChatBot;

    /**
     * Inicia a aplicação.
     */
    public run(): void {
        super.run();

        this.chatBot.start()
            .catch(error => Logger.post(() => `Error when start the ChatBot: {0}`, error, LogLevel.Error, LogContext.ChatWatcherApp));
    }

    /**
     * Lista de atual de usuários nos canais.
     * @private
     */
    private readonly channelsUsers: KeyValue<string[]> = { };

    /**
     * Atualiza a lista de canais e usuários.
     * @param data Dados do canal e usuário.
     * @param action Ação
     * @private
     */
    private update(data: ChatJoinPartModel, action: 'add' | 'remove'): void {
        const users = this.channelsUsers[data.channel.name] = this.channelsUsers[data.channel.name] || [];
        const indexOf = users.indexOf(data.userName);

        switch (action) {
            case 'add':
                if (indexOf < 0) users.push(data.userName);
                break;
            case 'remove':
                if (indexOf >= 0) users.splice(indexOf, 1);
                break;
        }
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatJoinEvent
     * @private
     */
    private handlerChatJoinEvent(message: ChatJoinEvent) {
        Logger.post("Channel: {0}. Joined: {1}", [message.join.channel.name, message.join.userName, message], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.join, 'add');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatPartEvent
     * @private
     */
    private handlerChatPartEvent(message: ChatPartEvent) {
        Logger.post("Channel: {0}. Parted: {1}", [message.part.channel.name, message.part.userName, message], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.part, 'remove');
    }
}
