import {
    Client,
    Options,
    AnonSubGiftUpgradeUserstate,
    ChatUserstate,
    DeleteUserstate,
    EmoteObj,
    Events,
    MsgID,
    PrimeUpgradeUserstate,
    RoomState,
    SubGiftUpgradeUserstate,
    SubGiftUserstate,
    SubMethods,
    SubMysteryGiftUserstate,
    SubUserstate
} from 'tmi.js'
import {Environment} from "../Core/Environment";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {RedeemEvent} from "./MessageEvent/RedeemEvent";
import {RedeemModel} from "./Model/RedeemModel";
import {EnvironmentQuery} from "../Core/MessageQuery/EnvironmentQuery";
import {SendChatMessageCommand} from "./MessageCommand/SendChatMessageCommand";
import {Message} from "../Bus/Message";

/**
 * Cliente ChatBot da Twitch
 */
export class ChatBot implements Events {
    /**
     * Construtor.
     */
    public constructor() {
        const environment = new EnvironmentQuery().request().message.environment;
        const options = ChatBot.factoryClientOptions(environment);
        this.client = new Client(options);

        ChatBot.registerEvents(this.client, this);

        Message.capture(SendChatMessageCommand, this, this.handlerSendChatMessageCommand);
    }

    /**
     * Client IRC da Twitch.
     * @private
     */
    private readonly client: Client;

    /**
     * Monta o objeto com informações para conexão do chatbox.
     * @param environment Informação de configuração do ambiente.
     * @private
     */
    private static factoryClientOptions(environment: Environment): Options {
        const channels = environment.coins.map(coin => coin.channels).flat<string>();
        return {
            options: {
                clientId: environment.applicationName,
                debug: !environment.isProduction,
                messagesLogLevel: environment.isProduction ? "info" : "debug",
            },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username: environment.chatBot.username,
                password: environment.chatBot.token,
            },
            channels: channels,
            logger: Object.assign({
                info: (message: string) => Logger.post(message, undefined, LogLevel.Debug, LogContext.ChatBoxTmi),
                warn: (message: string) => Logger.post(message, undefined, LogLevel.Warning, LogContext.ChatBoxTmi),
                error: (message: string) => Logger.post(message, undefined, LogLevel.Error, LogContext.ChatBoxTmi),
            }, {
                debug: (message: string) => Logger.post(message, undefined, LogLevel.Verbose, LogContext.ChatBoxTmi)
            }),
        };
    }

    /**
     * Estabelece a conexão.
     */
    public async start(): Promise<void> {
        await this.client.connect();
    }

    /**
     * Processar mensagem
     * @param message SendChatMessageCommand
     * @private
     */
    private handlerSendChatMessageCommand(message: SendChatMessageCommand) {
        this.client.say(message.channel, message.message);
    }

    /**
     * Registra os eventos do client IRC.
     * @param client Cliente IRC.
     * @param eventHandler Classe para handler dos eventos.
     * @private
     */
    private static registerEvents(client: Client, eventHandler: Events): void {
        client.on('raw_message', eventHandler.raw_message);
        client.on('action', eventHandler.action);
        client.on('anongiftpaidupgrade', eventHandler.anongiftpaidupgrade);
        client.on('automod', eventHandler.automod);
        client.on('ban', eventHandler.ban);
        client.on('chat', eventHandler.chat);
        client.on('cheer', eventHandler.cheer);
        client.on('clearchat', eventHandler.clearchat);
        client.on('connected', eventHandler.connected);
        client.on('connecting', eventHandler.connecting);
        client.on('disconnected', eventHandler.disconnected);
        client.on('emoteonly', eventHandler.emoteonly);
        client.on('emotesets', eventHandler.emotesets);
        client.on('followersonly', eventHandler.followersonly);
        client.on('giftpaidupgrade', eventHandler.giftpaidupgrade);
        client.on('hosted', eventHandler.hosted);
        client.on('hosting', eventHandler.hosting);
        client.on('join', eventHandler.join);
        client.on('logon', eventHandler.logon);
        client.on('message', eventHandler.message);
        client.on('messagedeleted', eventHandler.messagedeleted);
        client.on('mod', eventHandler.mod);
        client.on('mods', eventHandler.mods);
        client.on('notice', eventHandler.notice);
        client.on('part', eventHandler.part);
        client.on('ping', eventHandler.ping);
        client.on('pong', eventHandler.pong);
        client.on('primepaidupgrade', eventHandler.primepaidupgrade);
        client.on('r9kbeta', eventHandler.r9kbeta);
        client.on('raided', eventHandler.raided);
        client.on('reconnect', eventHandler.reconnect);
        client.on('redeem', eventHandler.redeem);
        client.on('resub', eventHandler.resub);
        client.on('roomstate', eventHandler.roomstate);
        client.on('serverchange', eventHandler.serverchange);
        client.on('slowmode', eventHandler.slowmode);
        client.on('subgift', eventHandler.subgift);
        client.on('submysterygift', eventHandler.submysterygift);
        client.on('subscribers', eventHandler.subscribers);
        client.on('subscription', eventHandler.subscription);
        client.on('timeout', eventHandler.timeout);
        client.on('unhost', eventHandler.unhost);
        client.on('unmod', eventHandler.unmod);
        client.on('vips', eventHandler.vips);
        client.on('whisper', eventHandler.whisper);
    }

    /**
     * Registra um log genérico.
     * @param description Descrição.
     * @param data Dados relacionados.
     * @private
     */
    private static log(description: string, data: any): void {
        Logger.post(() => `${description}: {0}`, [() => JSON.stringify(data, undefined, 2), data], LogLevel.Verbose, LogContext.ChatBox);
    }

    /**
     * IRC data was received and parsed
     * @param messageCloned A deep clone of the message data object
     * @param message The message data object
     */
    public raw_message(messageCloned: { [p: string]: any }, message: { [p: string]: any }): void {
        ChatBot.log('raw_message', arguments);
    }

    /**
     * Received action message on channel. (/me <message>) Use the "message" event to get regular messages, action messages, and whispers all together.
     * @param channel Channel name
     * @param userstate Userstate object
     * @param message Message received
     * @param self Message was sent by the client
     */
    public action(channel: string, userstate: ChatUserstate, message: string, self: boolean): void {
        ChatBot.log('action', arguments);
    }

    /**
     * Username is continuing the Gift Sub they got from an anonymous user in channel.
     * @param channel Channel name
     * @param username Username
     * @param userstate Userstate object
     */
    public anongiftpaidupgrade(channel: string, username: string, userstate: AnonSubGiftUpgradeUserstate): void {
        ChatBot.log('anongiftpaidupgrade', arguments);
    }

    /**
     *
     * @param channel
     * @param msgID
     * @param message
     */
    public automod(channel: string, msgID: "msg_rejected" | "msg_rejected_mandatory", message: string): void {
        ChatBot.log('automod', arguments);
    }

    /**
     * Username has been banned on a channel. To get the reason and other data, use Twitch's PubSub topic "chat_moderator_actions".
     * @param channel Channel name
     * @param username Username
     * @param reason Deprecated, always null. See event description above
     */
    public ban(channel: string, username: string, reason: string): void {
        ChatBot.log('ban', arguments);
    }

    /**
     * Received a regular message on channel. Use the "message" event to get regular messages, action messages, and whispers all together.
     * @param channel Channel name
     * @param userstate Userstate object
     * @param message Message received
     * @param self Message was sent by the client
     */
    public chat(channel: string, userstate: ChatUserstate, message: string, self: boolean): void {
        ChatBot.log('chat', arguments);
    }

    /**
     * Username has cheered to a channel.
     * @param channel Channel name
     * @param userstate Userstate object
     * @param message Message
     */
    public cheer(channel: string, userstate: ChatUserstate, message: string): void {
        ChatBot.log('cheer', arguments);
    }

    /**
     * Chat of a channel got cleared
     * @param clearchat Channel name
     */
    public clearchat(clearchat: string): void {
        ChatBot.log('clearchat', arguments);
    }

    /**
     * Connected to server
     * @param address Remote address
     * @param port Remote port
     */
    public connected(address: string, port: number): void {
        ChatBot.log('connected', arguments);
    }

    /**
     * Connecting to a server
     * @param address Remote address
     * @param port Remote port
     */
    public connecting(address: string, port: number): void {
        ChatBot.log('connecting', arguments);
    }

    /**
     * Got disconnected from server
     * @param reason Reason why you got disconnected
     */
    public disconnected(reason: string): void {
        ChatBot.log('disconnected', arguments);
    }

    /**
     * Channel enabled or disabled emote-only mode.
     * @param channel Channel name
     * @param enabled Returns true if mode is enabled or false if disabled
     */
    public emoteonly(channel: string, enabled: boolean): void {
        ChatBot.log('emoteonly', arguments);
    }

    /**
     * Received the emote-sets from Twitch.
     * @param sets Your emote sets (always contains the default emoticons set 0)
     * @param obj Your emote sets with IDs and codes received from the Twitch API
     */
    public emotesets(sets: string, obj: EmoteObj): void {
        ChatBot.log('emotesets', arguments);
    }

    /**
     * Channel enabled or disabled followers-only mode.
     * @param channel Channel name
     * @param enabled Returns true if mode is enabled or false if disabled
     * @param length Length in minutes
     */
    public followersonly(channel: string, enabled: boolean, length: number): void {
        ChatBot.log('followersonly', arguments);
    }

    /**
     * Username is continuing the Gift Sub they got from sender in channel.
     * @param channel Channel name
     * @param username Username
     * @param sender Sender username
     * @param userstate Userstate object
     */
    public giftpaidupgrade(channel: string, username: string, sender: string, userstate: SubGiftUpgradeUserstate): void {
        ChatBot.log('giftpaidupgrade', arguments);
    }

    /**
     * Channel is now hosted by another broadcaster. This event is fired only if you are logged in as the broadcaster.
     * @param channel Channel name being hosted
     * @param username Username hosting you
     * @param viewers Viewers count
     * @param autohost Auto-hosting
     */
    public hosted(channel: string, username: string, viewers: number, autohost: boolean): void {
        ChatBot.log('hosted', arguments);
    }

    /**
     * Channel is now hosting another channel
     * @param channel Channel name that is now hosting
     * @param target Channel being hosted
     * @param viewers Viewers count
     */
    public hosting(channel: string, target: string, viewers: number): void {
        ChatBot.log('hosting', arguments);
    }

    /**
     * Username has joined a channel. Not available on large channels and is also sent in batch every 30-60secs
     * @param channel Channel name
     * @param username Username who joined the channel
     * @param self Client has joined the channel
     */
    public join(channel: string, username: string, self: boolean): void {
        ChatBot.log('join', arguments);
    }

    /**
     * Connection established, sending informations to server
     */
    public logon(): void {
        ChatBot.log('logon', arguments);
    }

    /**
     * Received a message. This event is fired whenever you receive a chat, action or whisper message
     * @param channel Channel name
     * @param userstate Userstate object
     * @param message Message received
     * @param self Message was sent by the client
     */
    public message(channel: string, userstate: ChatUserstate, message: string, self: boolean): void {
        ChatBot.log('message', arguments);
    }

    /**
     * Message was deleted/removed.
     * @param channel Channel name
     * @param username Username
     * @param deletedMessage The message that was deleted
     * @param userstate Userstate object
     */
    public messagedeleted(channel: string, username: string, deletedMessage: string, userstate: DeleteUserstate): void {
        ChatBot.log('messagedeleted', arguments);
    }

    /**
     * Someone got modded on a channel
     * @param channel Channel name
     * @param username Username
     */
    public mod(channel: string, username: string): void {
        ChatBot.log('mod', arguments);
    }

    /**
     * Received the list of moderators of a channel
     * @param channel Channel name
     * @param mods Moderators of the channel
     */
    public mods(channel: string, mods: string[]): void {
        ChatBot.log('mods', arguments);
    }

    /**
     * Received a notice from server. The goal of these notices is to allow the users to change their language settings and still be able to know programmatically what message was sent by the server. We encourage to use the msg-id to compare these messages. See this Twitch documentation for an up-to-date list
     * Known msg-ids:
     *   already_banned: X is already banned in this room.
     *   already_emote_only_on: This room is already in emote-only mode.
     *   already_emote_only_off: This room is not in emote-only mode.
     *   already_subs_on: This room is already in subscribers-only mode.
     *   already_subs_off: This room is not in subscribers-only mode.
     *   bad_ban_admin: You cannot ban admin X.
     *   bad_ban_broadcaster: You cannot ban the broadcaster.
     *   bad_ban_global_mod: You cannot ban global moderator X.
     *   bad_ban_self: You cannot ban yourself.
     *   bad_ban_staff: You cannot ban staff X.
     *   bad_commercial_error: Failed to start commercial.
     *   bad_host_hosting: This channel is already hosting X.
     *   bad_host_rate_exceeded: Host target cannot be changed more than 3 times every half hour.
     *   bad_mod_mod: X is already a moderator of this room.
     *   bad_mod_banned: X is banned in this room.
     *   bad_timeout_admin: You cannot timeout admin X.
     *   bad_timeout_global_mod: You cannot timeout global moderator X.
     *   bad_timeout_self: You cannot timeout yourself.
     *   bad_timeout_staff: You cannot timeout staff X.
     *   bad_unban_no_ban: X is not banned from this room.
     *   bad_unmod_mod: X is not a moderator of this room.
     *   ban_success: X is now banned from this room.
     *   cmds_available: Commands available to you in this room (use /help for details)..
     *   color_changed: Your color has been changed.
     *   commercial_success: Initiating X second commercial break. Please keep in mind..
     *   emote_only_on: This room is now in emote-only mode.
     *   emote_only_off: This room is no longer in emote-only mode.
     *   hosts_remaining: X host commands remaining this half hour.
     *   host_target_went_offline: X has gone offline. Exiting host mode
     *   mod_success: You have added X as a moderator of this room.
     *   msg_banned: You are permanently banned from talking in channel.
     *   msg_censored_broadcaster: Your message was modified for using words banned by X.
     *   msg_channel_suspended: This channel has been suspended.
     *   msg_duplicate: Your message was not sent because you are sending messages too quickly.
     *   msg_emoteonly: This room is in emote only mode.
     *   msg_ratelimit: Your message was not sent because you are sending messages too quickly.
     *   msg_subsonly: This room is in subscribers only mode. To talk, purchase..
     *   msg_timedout: You are banned from talking in X for Y more seconds.
     *   msg_verified_email: This room requires a verified email address to chat.
     *   no_help: No help available.
     *   no_permission: You don't have permission to perform that action.
     *   not_hosting: No channel is currently being hosted.
     *   timeout_success: X has been timed out for length seconds.
     *   unban_success: X is no longer banned from this room.
     *   unmod_success: You have removed X as a moderator of this room.
     *   unrecognized_cmd: Unrecognized command: X
     *   usage_ban: Usage: "/ban " - Permanently prevent a user from chatting..
     *   usage_clear: Usage: "/clear" - Clear chat history for all users in this room.
     *   usage_color: Usage: "/color " - Change your username color. Color must be..
     *   usage_commercial: Usage: "/commercial [length]" - Triggers a commercial.
     *   usage_disconnect: Usage: "/disconnect" - Reconnects to chat.
     *   usage_emote_only_on: Usage: "/emoteonly" - Enables emote-only mode..
     *   usage_emote_only_off: Usage: "/emoteonlyoff" - Disables emote-only mode..
     *   usage_help: Usage: "/help" - Lists the commands available to you in this room.
     *   usage_host: Usage: "/host " - Host another channel. Use "unhost" to unset host mode.
     *   usage_me: Usage: "/me " - Send an "emote" message in the third person.
     *   usage_mod: Usage: "/mod " - Grant mod status to a user. Use "mods" to list the..
     *   usage_mods: Usage: "/mods" - Lists the moderators of this channel.
     *   usage_r9k_on: Usage: "/r9kbeta" - Enables r9k mode. See http://bit.ly/bGtBDf for details.
     *   usage_r9k_off: Usage: "/r9kbetaoff" - Disables r9k mode.
     *   usage_slow_on: Usage: "/slow [duration]" - Enables slow mode..
     *   usage_slow_off: Usage: "/slowoff" - Disables slow mode.
     *   usage_subs_on: Usage: "/subscribers" - Enables subscribers-only mode..
     *   usage_subs_off: Usage: "/subscribersoff" - Disables subscribers-only mode.
     *   usage_timeout: Usage: "/timeout [duration]" - Temporarily prevent a user from chatting.
     *   usage_unban: Usage: "/unban " - Removes a ban on a user.
     *   usage_unhost: Usage: "/unhost" - Stop hosting another channel.
     *   usage_unmod: Usage: "/unmod " - Revoke mod status from a user..
     *   whisper_invalid_self: You cannot whisper to yourself.
     *   whisper_limit_per_min: You are sending whispers too fast. Try again in a minute.
     *   whisper_limit_per_sec: You are sending whispers too fast. Try again in a second.
     *   whisper_restricted_recipient: That user's settings prevent them from receiving this whisper.
     * The following msg-ids wont be returned in the notice event because they are already available as event listeners:
     *   host_off: Exited hosting mode.
     *   host_on: Now hosting X
     *   no_mods: There are no moderators for this room.
     *   r9k_off: This room is no longer in r9k mode.
     *   r9k_on: This room is now in r9k mode.
     *   room_mods: The moderators of this room are X
     *   slow_off: This room is no longer in slow mode.
     *   slow_on: This room is now in slow mode. You may send messages every X seconds.
     *   subs_off: This room is no longer in subscribers-only mode.
     *   subs_on: This room is now in subscribers-only mode.
     * @param channel Channel name
     * @param msgid Message ID (See known msg-ids below)
     * @param message Message received
     */
    public notice(channel: string, msgid: MsgID, message: string): void {
        ChatBot.log('notice', arguments);
    }

    /**
     * User has left a channel
     * @param channel Channel name
     * @param username Username who left the channel
     * @param self Client has left the channel
     */
    public part(channel: string, username: string, self: boolean): void {
        ChatBot.log('part', arguments);
    }

    /**
     * Received PING from server
     */
    public ping(): void {
        ChatBot.log('ping', arguments);
    }

    /**
     * Sent a PING request ? PONG
     * @param latency
     */
    public pong(latency: number): void {
        ChatBot.log('pong', arguments);
    }

    /**
     *
     * @param channel
     * @param username
     * @param methods
     * @param userstate
     */
    public primepaidupgrade(channel: string, username: string, methods: SubMethods, userstate: PrimeUpgradeUserstate): void {
        ChatBot.log('primepaidupgrade', arguments);
    }

    /**
     * Channel enabled or disabled R9K mode
     * @param channel Channel name
     * @param enabled Returns true if mode is enabled or false if disabled
     */
    public r9kbeta(channel: string, enabled: boolean): void {
        ChatBot.log('r9kbeta', arguments);
    }

    /**
     * Channel is now being raided by another broadcaster.
     * @param channel Channel name being raided
     * @param username Username raiding the channel
     * @param viewers Viewers count
     */
    public raided(channel: string, username: string, viewers: number): void {
        ChatBot.log('raided', arguments);
    }

    /**
     * Trying to reconnect to server
     */
    public reconnect(): void {
        ChatBot.log('reconnect', arguments);
    }

    /**
     *
     * @param channel
     * @param username
     * @param rewardType
     * @param tags
     * @param message
     */
    public redeem(channel: string, username: string, rewardType: "highlighted-message" | "skip-subs-mode-message" | string, tags: ChatUserstate, message: string = ''): void {
        ChatBot.log('redeem', arguments);
        new RedeemEvent(new RedeemModel(channel, tags, rewardType, message, arguments)).send();
    }

    /**
     * Username has resubbed on a channel.
     * streakMonths will be 0 unless the user shares their streak. userstate will have a lot of other data pertaining to the message
     * @param channel Channel name
     * @param username Username
     * @param months Streak months
     * @param message Custom message
     * @param userstate Userstate object
     * @param methods Resub methods and plan (such as Prime)
     */
    public resub(channel: string, username: string, months: number, message: string, userstate: SubUserstate, methods: SubMethods): void {
        ChatBot.log('resub', arguments);
    }

    /**
     * Triggered upon joining a channel. Gives you the current state of the channel
     * @param channel Channel name
     * @param state Current state of the channel
     */
    public roomstate(channel: string, state: RoomState): void {
        ChatBot.log('roomstate', arguments);
    }

    /**
     * Channel is no longer located on this cluster
     * @param channel Channel name
     */
    public serverchange(channel: string): void {
        ChatBot.log('serverchange', arguments);
    }

    /**
     *
     * @param channel
     * @param enabled
     * @param length
     */
    public slowmode(channel: string, enabled: boolean, length: number): void {
        ChatBot.log('slowmode', arguments);
    }

    /**
     * Username gifted a subscription to recipient in a channel
     * @param channel Channel name
     * @param username Sender username
     * @param streakMonths Streak months
     * @param recipient Recipient username
     * @param methods Methods and plan used to subscribe
     * @param userstate Userstate object
     */
    public subgift(channel: string, username: string, streakMonths: number, recipient: string, methods: SubMethods, userstate: SubGiftUserstate): void {
        ChatBot.log('subgift', arguments);
    }

    /**
     * Username is gifting a subscription to someone in a channel
     * @param channel Channel name
     * @param username Sender username
     * @param numbOfSubs Number of subgifts given in this transaction
     * @param methods Methods and plan used to subscribe
     * @param userstate Userstate object
     */
    public submysterygift(channel: string, username: string, numbOfSubs: number, methods: SubMethods, userstate: SubMysteryGiftUserstate): void {
        ChatBot.log('submysterygift', arguments);
    }

    /**
     * Channel enabled or disabled subscribers-only mode
     * @param channel Channel name
     * @param enabled Returns true if mode is enabled or false if disabled
     */
    public subscribers(channel: string, enabled: boolean): void {
        ChatBot.log('subscribers', arguments);
    }

    /**
     * Username has subscribed to a channel
     * @param channel Channel name
     * @param username Username
     * @param methods Methods and plan used to subscribe
     * @param message Custom message
     * @param userstate Userstate object
     */
    public subscription(channel: string, username: string, methods: SubMethods, message: string, userstate: SubUserstate): void {
        ChatBot.log('subscription', arguments);
    }

    /**
     * Username has been timed out on a channel. To get the reason and other data, use Twitch's PubSub topic "chat_moderator_actions".
     * @param channel Channel name
     * @param username Username
     * @param reason Deprecated, always null. See event description above
     * @param duration Duration of the timeout
     */
    public timeout(channel: string, username: string, reason: string, duration: number): void {
        ChatBot.log('timeout', arguments);
    }

    /**
     * Channel ended the current hosting
     * @param channel Channel name
     * @param viewers Viewer count
     */
    public unhost(channel: string, viewers: number): void {
        ChatBot.log('unhost', arguments);
    }

    /**
     * Someone got unmodded on a channel
     * Important: It doesn't detect if username got removed from moderators list. You will see a lot of mod / unmod events on a channel. When a moderator joins a channel, it will take a few seconds for jtv to give the user the moderator status. When leaving a channel, the user gets unmodded.
     * @param channel Channel name
     * @param username Username
     */
    public unmod(channel: string, username: string): void {
        ChatBot.log('unmod', arguments);
    }

    /**
     * Received the list of VIPs of a channel
     * @param channel Channel name
     * @param vips VIPs of the channel
     */
    public vips(channel: string, vips: string[]): void {
        ChatBot.log('vips', arguments);
    }

    /**
     * Received a whisper. You won't receive whispers from ignored users. Use the "message" event to get regular messages, action messages, and whispers all together.
     * @param from Username who sent the message
     * @param userstate Userstate object
     * @param message Message received
     * @param self Message was sent by the client
     */
    public whisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void {
        ChatBot.log('whisper', arguments);
    }
}
