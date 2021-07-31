import {Message} from "../../../../Bus/Message";

/**
 * Comando base para a blockchain se comunicar com o chat
 */
export abstract class BaseBlockchainChatCommand extends Message {
    /**
     * Resultado para exibição ao usuário.
     */
    public output: string[] = [];
}
