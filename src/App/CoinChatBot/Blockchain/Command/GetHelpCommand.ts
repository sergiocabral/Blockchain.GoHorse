import {BaseBlockchainChatCommand} from "./BaseBlockchainChatCommand";

/**
 * Cria um nova carteira
 */
export class GetHelpCommand extends BaseBlockchainChatCommand {
    /**
     * Construtor.
     * @param language Idioma.
     */
    public constructor(public readonly language: string | undefined) {
        super();
    }
}
