import {BaseChatCommand} from "./BaseChatCommand";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";
import {TwitchProfileCreateCommand} from "../Blockchain/Command/TwitchProfileCreateCommand";

/**
 * Cria o perfil na blockchain
 * Comando: !cabr0n profile set
 */
export class ProfileSetChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string | RegExp)[][] = [
        [ "profile", "set" ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Mensagem original.
     * @protected
     */
    protected run(args: string[], message: ChatMessageModel): string | string[] {
        return new TwitchProfileCreateCommand(message.user).request().message.output;
    }
}
