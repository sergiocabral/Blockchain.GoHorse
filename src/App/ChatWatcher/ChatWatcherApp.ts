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
import {UserOnChatModel} from "./Model/UserOnChatModel";
import {ChatMessageEvent} from "../../Twitch/MessageEvent/ChatMessageEvent";
import {SendChatMessageCommand} from "../../Twitch/MessageCommand/SendChatMessageCommand";
import {ClockEvent} from "../../Core/MessageEvent/ClockEvent";
import Timeout = NodeJS.Timeout;
import {performance} from "perf_hooks";

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
        Message.capture(ClockEvent, this, this.handlerClockEvent);

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
        let user = users?.find(user => user.userName.toLowerCase() === userName.toLowerCase());

        if (user) {
            user.updated = new Date();
            return user;
        }

        user = new UserOnChatModel(userName);
        users.push(user);

        const tags = this.environmentApplication.tags[user.userName.toLowerCase()]?.split(/[|,;\s]+/);
        user.tags = tags ?? [];
        user.tags.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));

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

        const firstMessage = user.messageCount++ === 0;
        if (firstMessage) {
            Logger.post("Channel: {0}. First message from user: {1}", [channelName, userName], LogLevel.Debug, LogContext.ChatWatcherApp);

            if (user.tags.length) {
                const messageCommands = user.tags.map(tag => {
                    const tags = this.environmentApplication.automaticFirstMessagesForTag[channelName.toLowerCase()] ?? [];
                    const messages = tags[tag.toLowerCase()] ?? [];
                    return messages.map(message => new SendChatMessageCommand(channelName, message.translate().querystring([userName, channelName])));
                }).flat<SendChatMessageCommand>();

                if (messageCommands.length) {
                    messageCommands.forEach(messageCommand => messageCommand.send());
                    Logger.post(() => 'Answer first message from user "{1}" on channel "{0}" because of tags: {2}', [channelName, userName, () => user.tags.join(", ")], LogLevel.Debug, LogContext.ChatWatcherApp);
                }
            }
        }
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
            const fileContent = this.factoryReport();
            fs.writeFileSync(this.environmentApplication.outputFile, Buffer.from(fileContent));
            Logger.post('Report saved: {0}', this.environmentApplication.outputFile, LogLevel.Debug, LogContext.ChatWatcherApp);
        };

        clearTimeout(this.saveReportTimeout);
        const saveAfterMilliseconds = 1000;
        this.saveReportTimeout = setTimeout(action, saveAfterMilliseconds);
    }

    /**
     * Intervalo entre as gravações no log.
     * @private
     */
    private logReportInterval: number = 1000 * 60 * 5;

    /**
     * Controle do último log do relatório
     * @private
     */
    private lastReportLog: number = performance.now() - this.logReportInterval + 1000 * 60;

    /**
     * Registra o relatório atual no log
     * @private
     */
    private logReport(writeNow: boolean = false): void {
        const now = performance.now();
        writeNow = writeNow || (now - this.lastReportLog >= this.logReportInterval);
        if (!writeNow) return;
        this.lastReportLog = now;

        const content = this.factoryReport();
        Logger.post('Chat Watcher Report:\n{0}', [content, { event: "ChatWatcherReport" }], LogLevel.Information, LogContext.ChatWatcherApp);
    }

    /**
     * Prepara o texto do relatório com o estado atual dos canais e usuários.
     * @private
     */
    private factoryReport(): string {
        const lines = [];

        for (const channel in this.channelsUsers) {
            if (!this.channelsUsers.hasOwnProperty(channel)) continue;

            const total = this.channelsUsers[channel].length;
            const joined = this.channelsUsers[channel].filter(user => user.joined).length;
            lines.push(`#${channel}: ${joined}/${total}`);

            ([] as UserOnChatModel[])
                .concat(this.channelsUsers[channel])
                .sort((a: UserOnChatModel, b: UserOnChatModel) => {
                    if (!a.tags.includes('bot') && b.tags.includes('bot')) return -1;
                    else if (a.tags.includes('bot') && !b.tags.includes('bot')) return +1;
                    else if (a.joined && !b.joined) return -1;
                    else if (!a.joined && b.joined) return +1;
                    else if (a.messageCount > b.messageCount) return -1;
                    else if (a.messageCount < b.messageCount) return +1;
                    else if (a.updated > b.updated) return -1;
                    else if (a.updated < b.updated) return +1;
                    else return a.userName.localeCompare(b.userName);
                })
                .forEach(user => lines.push(
                    `${user.messageCount.toString().padStart(6)} | ` +
                    `${user.creation.format()} | ` +
                    `${user.updated.format()} | ` +
                    `${user.joined ? 'X' : ' '} | ` +
                    `${user.userName.padEnd(30)} | ` +
                    user.tags.join(', ')
                ));

            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatJoinEvent
     * @private
     */
    private handlerChatJoinEvent(message: ChatJoinEvent) {
        Logger.post("Channel: {0}. Joined: {1}", [message.join.channel.name, message.join.userName], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.join.channel.name, message.join.userName, 'add');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatPartEvent
     * @private
     */
    private handlerChatPartEvent(message: ChatPartEvent) {
        Logger.post("Channel: {0}. Parted: {1}", [message.part.channel.name, message.part.userName], LogLevel.Information, LogContext.ChatWatcherApp);
        this.update(message.part.channel.name, message.part.userName, 'remove');
    }

    /**
     * Processa resposta para mensagem.
     * @param message ChatMessageEvent
     * @private
     */
    private handlerChatMessageEvent(message: ChatMessageEvent) {
        this.incrementMessageCount(message.chatMessage.channel.name, message.chatMessage.user.name);
    }

    /**
     * Processa resposta para mensagem.
     * @param message ClockEvent
     * @private
     */
    private handlerClockEvent(message: ClockEvent) {
        this.logReport();
    }
}
