import {Message} from "../../../Bus/Message";
import {ChatJoinEvent} from "../../../Twitch/MessageEvent/ChatJoinEvent";
import {ChatPartEvent} from "../../../Twitch/MessageEvent/ChatPartEvent";
import {KeyValue} from "../../../Helper/Types/KeyValue";
import {UserOnChatModel} from "../Model/UserOnChatModel";
import {ChatMessageEvent} from "../../../Twitch/MessageEvent/ChatMessageEvent";
import {UserFirstMessageEvent} from "../MessageEvent/UserFirstMessageEvent";
import Timeout = NodeJS.Timeout;
import {ReportUpdated} from "../MessageEvent/ReportUpdated";

/**
 * Controle de entrada e saída do canal.
 */
export class UserWatcher {

    /**
     * Construtor.
     */
    public constructor() {
        Message.capture(ChatJoinEvent, this, this.handlerChatJoinEvent);
        Message.capture(ChatPartEvent, this, this.handlerChatPartEvent);
        Message.capture(ChatMessageEvent, this, this.handlerChatMessageEvent);
    }

    /**
     * Lista de canais e usuário presentes
     * @private
     */
    private readonly channelsUsers: KeyValue<UserOnChatModel[]> = { };

    /**
     * Timeout para notificar atualizados de dados.
     * @private
     */
    private notifyReportUpdatedTimeout: Timeout = 0 as any;

    /**
     * Notifica a atualização do relatórios.
     * @private
     */
    private notifyReportUpdated(): void {
        const waitForSeconds = 10;
        clearTimeout(this.notifyReportUpdatedTimeout);
        this.notifyReportUpdatedTimeout =
            setTimeout(() =>
                new ReportUpdated(this.channelsUsers).send(),
                waitForSeconds * 1000);
    }

    /**
     * Listar canais.
     */
    public getChannels(): string[] {
        return Object.keys(this.channelsUsers);
    }

    /**
     * Listar usuários de um canal.
     * @param channel
     */
    public getUsers(channel: string): UserOnChatModel[] {
        return this.channelsUsers[channel] ?? [ ];
    }

    /**
     * Retorna (e cria se não existir) um modelo de usuário.
     * @param channel Canal.
     * @param username Usuário.
     * @private
     */
    private getOrCreate(channel: string, username: string): UserOnChatModel {
        this.channelsUsers[channel] = this.channelsUsers[channel] || [ ];
        let user = this.channelsUsers[channel].find(user => user.userName === username);
        if (!user) {
            user = new UserOnChatModel(username);
            this.channelsUsers[channel].push(user);
        }
        return user;
    }

    /**
     * Captura de mensagem.
     * @param message ChatJoinEvent
     * @private
     */
    private handlerChatJoinEvent(message: ChatJoinEvent) {
        const model = this.getOrCreate(message.join.channel.name, message.join.userName);
        model.joined = true;
        this.notifyReportUpdated();
    }

    /**
     * Captura de mensagem.
     * @param message ChatPartEvent
     * @private
     */
    private handlerChatPartEvent(message: ChatPartEvent) {
        const model = this.getOrCreate(message.part.channel.name, message.part.userName);
        model.joined = false;
        this.notifyReportUpdated();
    }

    /**
     * Captura de mensagem.
     * @param message ChatMessageEvent
     * @private
     */
    private handlerChatMessageEvent(message: ChatMessageEvent) {
        const model = this.getOrCreate(message.chatMessage.channel.name, message.chatMessage.user.name);
        model.messageCount++;
        if (model.messageCount === 1) {
            new UserFirstMessageEvent(message.chatMessage.channel.name, message.chatMessage.user.name).send();
        }
        this.notifyReportUpdated();
    }
}
