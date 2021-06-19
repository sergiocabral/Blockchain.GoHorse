import {IModel} from "../../Core/IModel";
import {UserModel} from "./UserModel";
import {ChannelModel} from "./ChannelModel";
import {ChatUserstate} from "tmi.js";
import {InvalidExecutionError} from "../../Errors/InvalidExecutionError";

/**
 * Modelo com os dados do resgate
 */
export class ChatMessageModel implements IModel {
    /**
     * Construtor.
     * @param channelName Nome do canal.
     * @param userData Dados do usuário.
     * @param message Mensage.
     * @param self Sinaliza que foi o próprio usuário que escreveu.
     * @param raw Dado original em formato bruto.
     */
    public constructor(
        channelName: string,
        userData: ChatUserstate,
        public message: string,
        public self: boolean,
        public raw?: any) {
        this.channel = new ChannelModel(channelName);
        this.user = new UserModel(userData);
    }

    /**
     * Determina se o modelo está preenchido.
     */
    public isFilled(): boolean {
        return (
            this.channel.isFilled() &&
            this.user.isFilled() &&
            Boolean(this.message)
        );
    }

    /**
     * Canal.
     */
    public channel: ChannelModel;

    /**
     * Usuário.
     */
    public user: UserModel;

    /**
     * Prefixo de comando.
     * @private
     */
    private static commandPrefix: string = '!';

    /**
     * Aspas para englobar argumentos.
     * @private
     */
    private static commandArgumentQuote: string = '"';

    /**
     * Determina se a mensagem é um comando.
     */
    public get isCommand(): boolean {
        return this.message.trim().startsWith(ChatMessageModel.commandPrefix);
    }

    /**
     * Comando sem os argumentos.
     */
    public get command(): string {
        if (!this.isCommand) throw new InvalidExecutionError('Is not a command.');
        return this.message.trim().split(/\s+/)[0].substr(ChatMessageModel.commandPrefix.length).toLowerCase();
    }

    /**
     * Argumentos do comando.
     */
    public getCommandArguments(): string[] {
        if (!this.isCommand) throw new InvalidExecutionError('Is not a command.');

        const regexQuoted = /"[^"]+"/g;
        let input = this.message;
        const intoQuotes = input.match(regexQuoted);
        if (intoQuotes) {
            intoQuotes.forEach(match =>
                input = input.replace(match, match.replace(/\s/g, String.fromCharCode(0))));
        }

        return input
            .split(/\s+/)
            .map((argument, index) => {
                if (argument.startsWith(ChatMessageModel.commandArgumentQuote)) {
                    argument = argument
                        .substr(1, argument.length - 2)
                        .replace(/\0/g, " ");
                }
                if (index === 0) argument = argument.substr(ChatMessageModel.commandPrefix.length);
                return argument;
            });
    }
}
