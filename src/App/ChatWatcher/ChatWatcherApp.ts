import fs from 'fs';
import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {BaseApp} from "../../Core/BaseApp";
import {Message} from "../../Bus/Message";
import {ChatJoinEvent} from "../../Twitch/MessageEvent/ChatJoinEvent";
import {ChatPartEvent} from "../../Twitch/MessageEvent/ChatPartEvent";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";
import Timeout = NodeJS.Timeout;
import {UserOnChatModel} from "./Model/UserOnChatModel";
import {ChatMessageEvent} from "../../Twitch/MessageEvent/ChatMessageEvent";

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
        Message.capture(ChatMessageEvent, this, this.handlerChatMessageEvent);

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
    private readonly channelsUsers: KeyValue<UserOnChatModel[]> = { };

    /**
     * Adiciona um canal na lista.
     * @param channelName
     * @param autoInsert Insere caso não exista.
     * @private
     */
    private getOrAddChannel(channelName: string, autoInsert: boolean = false): UserOnChatModel[] {
        return this.channelsUsers[channelName] = this.channelsUsers[channelName] || [];
    }

    /**
     * Adiciona um usuário na lista de canais.
     * @param channelName
     * @param userName
     * @private
     */
    private getOrAddUser(channelName: string, userName: string): UserOnChatModel {
        const users = this.getOrAddChannel(channelName);
        let user = users?.find(user => user.userName === userName);

        if (user) {
            user.updated = new Date();
            return user;
        }

        user = new UserOnChatModel(userName);
        users.push(user);

        return user;
    }

    /**
     * Atualiza a lista de canais e usuários.
     * @param channelName
     * @param userName
     * @param action Ação
     * @private
     */
    private update(channelName: string, userName: string, action: 'add' | 'remove'): void {
        const user = this.getOrAddUser(channelName, userName);

        if (action === 'add') user.joined = true;
        else if (action === 'remove') user.joined = false;

        this.saveReport();
    }

    /**
     * Incrementa a contagem de mensagens do usuário.
     * @param channelName
     * @param userName
     * @private
     */
    private incrementMessageCount(channelName: string, userName: string): void {
        const user = this.getOrAddUser(channelName, userName);
        if (user) user.messageCount++;

        this.saveReport();
    }

    /**
     * Timeout para bounce do saveReport
     * @private
     */
    private saveReportTimeout: Timeout = 0 as any;

    /**
     * Grava em um arquivo o estado atual dos canais e usuários.
     * @private
     */
    private saveReport(): void {
        const action = () => {
            const lines = [];

            for (const channel in this.channelsUsers) {
                if (!this.channelsUsers.hasOwnProperty(channel)) continue;

                const total = this.channelsUsers[channel].length;
                const joined = this.channelsUsers[channel].filter(user => user.joined).length;
                lines.push(`#${channel}: ${joined}/${total}`);

                ([] as UserOnChatModel[])
                    .concat(this.channelsUsers[channel])
                    .sort((a: UserOnChatModel, b: UserOnChatModel) => {
                        if (a.joined && !b.joined) return -1;
                        else if (!a.joined && b.joined) return +1;
                        else if (a.messageCount > b.messageCount) return -1;
                        else if (a.messageCount < b.messageCount) return +1;
                        else if (a.updated > b.updated) return -1;
                        else if (a.updated < b.updated) return +1;
                        else return a.userName.localeCompare(b.userName);
                    })
                    .forEach(user => lines.push(
                        ` ${user.messageCount.toString().padStart(5)} | ${user.creation.format()} | ${user.updated.format()} | ${user.joined ? 'X' : ' '} | ${user.userName}`));
            }

            const fileContent = lines.join('\n');
            fs.writeFileSync(this.environmentApplication.outputFile, Buffer.from(fileContent));
            Logger.post('Report saved: {0}', this.environmentApplication.outputFile, LogLevel.Debug, LogContext.ChatWatcherApp);
        };

        clearTimeout(this.saveReportTimeout);
        const saveAfterMilliseconds = 1000;
        this.saveReportTimeout = setTimeout(action, saveAfterMilliseconds);
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatJoinEvent
     * @private
     */
    private handlerChatJoinEvent(message: ChatJoinEvent) {
        Logger.post("Channel: {0}. Joined: {1}", [message.join.channel.name, message.join.userName, message], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.join.channel.name, message.join.userName, 'add');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatPartEvent
     * @private
     */
    private handlerChatPartEvent(message: ChatPartEvent) {
        Logger.post("Channel: {0}. Parted: {1}", [message.part.channel.name, message.part.userName, message], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.part.channel.name, message.part.userName, 'remove');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatMessageEvent
     * @private
     */
    private handlerChatMessageEvent(message: ChatMessageEvent) {
        Logger.post("Channel: {0}. New message from: {1}", [message.chatMessage.channel.name, message.chatMessage.user.name, message], LogLevel.Debug, LogContext.ChatWatcherApp);
        this.incrementMessageCount(message.chatMessage.channel.name, message.chatMessage.user.name);
    }
}
