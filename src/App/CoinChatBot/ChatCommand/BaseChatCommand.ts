import {ChatListener} from "../../../Twitch/ChatListener/ChatListener";
import {ChatMessageModel} from "../../../Twitch/Model/ChatMessageModel";
import {ChatCommandConfiguration} from "./ChatCommandConfiguration";

/**
 * Classe base para comandos da blockchain.
 */
export abstract class BaseChatCommand extends ChatListener {

    /**
     * Construtor.
     * @param configuration Configurações gerais.
     */
    public constructor(protected configuration: ChatCommandConfiguration) {
        super();
    }

    /**
     * Comando para o funcionamento da blockchain.
     * @private
     */
    private possibleCommands: string[] = [
        "cabr0n",
        "cabron",
        "cabr0ncoin",
        "cabr0nc0in",
        "cabroncoin",
        "cabronc0in",
        "cc"
    ];

    /**
     * Nome do comando.
     */
    protected abstract subCommands: (string | RegExp)[][];

    /**
     * Execução do comando.
     * @param args Argumentos.
     * @param message Mensagem original.
     * @protected
     */
    protected abstract run(args: string[], message: ChatMessageModel): string | string[];

    /**
     * Valida se uma mensagem deve ser capturada.
     */
    public isMatch(message: ChatMessageModel): boolean {
        if (!message.isCommand) return false;

        const args = message.getCommandArguments();
        if (args.length < 1 || !this.possibleCommands.includes(args[0].toLowerCase())) return false;
        const argsOnlyWithSubCommands = args.slice(1);

        for (const subCommands of this.subCommands) {
            if (BaseChatCommand.commandsIsMatch(argsOnlyWithSubCommands, subCommands)) return true;
        }

        return false;
    }

    /**
     * Verifica se os argumentos atendem uma sequência de comandos
     * @param args Argumentos recebidos
     * @param commands Comandos esperados.
     * @private
     */
    private static commandsIsMatch(args: string[], commands: (string | RegExp)[]) {
        if (args.length > commands.length) return false;

        args = ([] as string[]).concat(args);
        const complementaryEmptyArray = new Array(commands.length - args.length).fill('');
        args.push(...complementaryEmptyArray);

        for (let i = 0; i < args.length && i < commands.length; i++) {
            const expression = commands[i];
            const argument = args[i];
            if (expression instanceof RegExp) {
                if (!new RegExp(expression, 'i').test(argument)) return false;
            } else {
                if (expression.toLowerCase() !== argument.toLowerCase()) return false;
            }
        }

        return true;
    }

    /**
     * Responde uma mensagem.
     * @param message
     * @return Texto de resposta.
     */
    public response(message: ChatMessageModel): string[] | string {
        let output = this.run(message.getCommandArguments(), message);
        if (Array.isArray(output)) {
            output = output.join(' ');
        }
        return output;
    };
}
