import {ChatCommand} from "../../../Twitch/ChatCommand/ChatCommand";

/**
 * Comando Hello Word.
 */
export class MinerChatCommand extends ChatCommand {
    /**
     * Comando a ser tratado.
     */
    public get command(): string {
        return 'miner';
    };

    /**
     * Execução do comando.
     * @param args Argumentos recebidos.
     * @return Texto a ser enviado para o chat.
     */
    public run(args: string[]): string {
        return 'Ops! Ainda não terminei o deselvolvimento do comando !miner... Na verdade o prazo de lançamento da Cabr0n Coin ficou adiado para o próximo 14/jun... Ah! Bom avisar que os asiáticos já começaram a treinar suas crianças para minerar Cabr0n Coin: https://youtu.be/1J6t1j38TaM?t=63';
    }
}
