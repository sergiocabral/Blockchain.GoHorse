import fs from 'fs';
import {ChatBot} from "../../Twitch/ChatBot";
import {Logger} from "../../Log/Logger";
import {LogLevel} from "../../Log/LogLevel";
import {LogContext} from "../../Log/LogContext";
import {BaseApp} from "../BaseApp";
import {Message} from "../../Bus/Message";
import {ChatJoinEvent} from "../../Twitch/MessageEvent/ChatJoinEvent";
import {ChatPartEvent} from "../../Twitch/MessageEvent/ChatPartEvent";
import {KeyValue} from "../../Helper/Types/KeyValue";
import {ChatWatcherEnvironment} from "./ChatWatcherEnvironment";
import Timeout = NodeJS.Timeout;
import {UserOnChatModel} from "./Model/UserOnChatModel";

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
    private readonly channelsUsers: KeyValue<UserOnChatModel[]> = { };

    /**
     * Adiciona um canal na lista.
     * @param channelName
     * @param autoInsert Insere caso não exista.
     * @private
     */
    private getChannel(channelName: string, autoInsert: boolean = false): UserOnChatModel[] | null {
        if (autoInsert) {
            return this.channelsUsers[channelName] = this.channelsUsers[channelName] || [];
        } else {
            return this.channelsUsers[channelName] || null;
        }
    }

    /**
     * Adiciona um usuário na lista de canais.
     * @param channelName
     * @param userName
     * @param autoInsert Insere caso não exista.
     * @private
     */
    private getUser(channelName: string, userName: string, autoInsert: boolean = false): UserOnChatModel | null {
        const users = this.getChannel(channelName, autoInsert);
        let user = users?.find(user => user.userName === userName);

        if (user) return user;

        if (autoInsert) {
            user = new UserOnChatModel(userName);
            users?.push(user);
        }

        return user || null;
    }

    /**
     * Atualiza a lista de canais e usuários.
     * @param channelName
     * @param userName
     * @param action Ação
     * @private
     */
    private update(channelName: string, userName: string, action: 'add' | 'remove'): void {
        switch (action) {
            case 'add':
                this.getUser(channelName, userName, true);
                break;
            case 'remove':
                const users = this.getChannel(channelName);
                if (users?.length) {
                    const indexOf = users.findIndex(user => user.userName === userName);
                    if (indexOf >= 0) users.splice(indexOf, 1);
                }
                break;
        }

        this.saveReport();
    }

    /**
     * Incrementa a contagem de mensagens do usuário.
     * @param channelName
     * @param userName
     * @private
     */
    private incrementMessageCount(channelName: string, userName: string): void {
        const user = this.getUser(channelName, userName, true);
        if (user) user.messageCount++;

        //TODO: Implementar o incremento do total de mensagens enviadas pelo usuário.
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
                lines.push(`#${channel}`);
                const users = this.channelsUsers[channel];
                for (const user of users) {
                    lines.push(`  - ${user}`);
                }
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
}
