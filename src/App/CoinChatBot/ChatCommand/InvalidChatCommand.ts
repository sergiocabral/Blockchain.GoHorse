import {BaseChatCommand} from "./BaseChatCommand";
import {ChatCommandConfiguration} from "./ChatCommandConfiguration";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";

/**
 * Captura comandos inválidos.
 */
export class InvalidChatCommand extends BaseChatCommand {
    /**
     * Construtor.
     * @param configuration Configurações gerais.
     */
    public constructor(configuration: ChatCommandConfiguration) {
        super(configuration);
        BaseChatCommand.invalidCommandCatcher = this;
    }

    /**
     * Parâmetros do comandos.
     */
    protected subCommands?: string[][];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Informações da mensagem do chat.
     * @protected
     */
    protected run(args: string[], message: ChatMessageModel): string | string[] {
        return BaseChatCommand.invalidCommand ? [
            '@{username}, Invalid parameters for {coinName}. For help type: !{coinCommand} --help'.translate().querystring({
                username: message.user.name,
                coinName: this.configuration.coin.name,
                coinCommand: this.possibleCommands[0]
            })
        ] : [];
    }
}
