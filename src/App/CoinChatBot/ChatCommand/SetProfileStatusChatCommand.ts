import {BaseChatCommand} from "./BaseChatCommand";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";
import {SetTwitchProfileCreateCommand} from "../Blockchain/Command/SetTwitchProfileCreateCommand";

/**
 * Cria o perfil na blockchain
 * Comando: !cabr0n profile "[message]"
 */
export class SetProfileStatusChatCommand extends BaseChatCommand {
    /**
     * Parâmetros do comandos.
     */
    protected subCommands: (string | RegExp)[][] = [
        [ /^-{0,2}profile$/, /^(|.*)$/ ],
        [ /^-{0,2}p$/, /^(|.*)$/ ]
    ];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Mensagem original.
     * @protected
     */
    protected run(args: string[], message: ChatMessageModel): string | string[] {
        return new SetTwitchProfileCreateCommand(message.user, args[2]).request().message.output;
    }
}
