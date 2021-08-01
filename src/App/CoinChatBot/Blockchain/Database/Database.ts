import {CoinModel} from "../../Model/CoinModel";
import {Patcher} from "./Patcher";
import {Persistence} from "./Persistence";
import {CommitModel} from "../../../../Process/Model/CommitModel";
import {Git} from "../../../../Process/Git";
import {WalletModel} from "./Model/WalletModel";
import {VersionSection} from "./Section/VersionSection";
import {WalletSection} from "./Section/WalletSection";
import {HelpSection} from "./Section/HelpSection";
import {Message} from "../../../../Bus/Message";
import {HelpGetCommand} from "../Command/HelpGetCommand";
import {TwitchWalletCreateCommand} from "../Command/TwitchWalletCreateCommand";
import {TwitchWalletGetCommand} from "../Command/TwitchWalletGetCommand";
import {WhoisTwitch} from "./Section/WhoisTwitch";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";

/**
 * Banco de dados com as informações da moeda.
 */
export class Database {
    /**
     * Versão atual do banco de dados.
     * ATENÇÃO!
     * Como a estrutura do banco de dados é definido pelo código-fonte
     * O número da versão é hard-coded pelo código-fonte
     * NÃO ESQUEÇA DE MUDAR A VERSÃO DO BANCO DE DADOS PARA QUE ISSO SEJA GRAVADO NA BLOCKCHAIN.
     * @private
     */
    public readonly version: number = 1;

    /**
     * Construtor.
     * @param coin Moeda
     * @param firstBlock Informações do primeiro bloco.
     * @param branchName Nome branch ativo.
     * @param directory Diretório do banco de dados.
     */
    public constructor(
        public readonly coin: CoinModel,
        public readonly firstBlock: CommitModel,
        public readonly branchName: string,
        public readonly directory: string) {
        this.persistence = new Persistence(directory);
        this.patcher = new Patcher(this.persistence, firstBlock, coin);

        Message.capture(HelpGetCommand, this.handlerHelpGetCommand.bind(this));
        Message.capture(TwitchWalletCreateCommand, this.handlerTwitchWalletCreateCommand.bind(this));
        Message.capture(TwitchWalletGetCommand, this.handlerTwitchWalletGetCommand.bind(this));
    }

    /**
     * Manipulador de entrada e saída no disco.
     * @private
     */
    public readonly persistence: Persistence;

    /**
     * Gerenciador de versões do repositório.
     * @private
     */
    private patcher: Patcher;

    /**
     * Seções do banco de dados.
     * @private
     */
    private section = {
        /**
         * Versão
         */
        version: new VersionSection(this),

        /**
         * Ajuda sobre os comandos, etc.
         */
        help: new HelpSection(this),

        /**
         * Carteiras
         */
        wallet: new WalletSection(this),

        /**
         * Usuário da twitch
         */
        whoisTwitch: new WhoisTwitch(this)
    }

    /**
     * Cria a estrutura inicial
     */
    public updateStructure(): number | boolean {
        const structureVersion = this.section.version.get();
        const applicationVersion = this.version;
        const newVersion = this.patcher.updateStructure(structureVersion, applicationVersion);
        if (typeof(newVersion) === 'number') this.section.version.set(newVersion);

        switch (this.version) {
            case 1:
                this.section.wallet.set(new WalletModel(this.firstBlock.hash, Git.toDate(this.firstBlock.committerDate)));
                break;
        }

        return newVersion;
    }

    /**
     * Atualiza os arquivos da documentação.
     */
    public updateDocumentation(): void {
        this.section.help.set();
    }

    /**
     * Captura de mensagem
     * @param message HelpGetCommand
     * @private
     */
    private handlerHelpGetCommand(message: HelpGetCommand): void {
        const branchName = this.branchName;
        const helpPath = this.section.help.get(message.language);
        const helpLink = `${this.coin.repositoryUrl}/blob/${branchName}${helpPath}`;
        message.output.push(`Access help in this link: {helpLink}`.translate().querystring({ helpLink }));
    }

    /**
     * Capturador de comando.
     * @param message CreateWallet
     * @private
     */
    private handlerTwitchWalletCreateCommand(message: TwitchWalletCreateCommand): void {
        this.section.whoisTwitch.set(message.twitchUser);
        this.section.wallet.setByTwitchUser(message.twitchUser);
        const wallet = this.section.wallet.getByTwitchUser(message.twitchUser);
        if (!wallet) throw new InvalidExecutionError("Wallet was created, but not found.");
        message.output.push(
            "Your wallet will be created in the next mined block from the blockchain: {walletId}"
                .translate()
                .querystring({walletId: wallet.id}));
    }

    /**
     * Capturador de comando.
     * @param message CreateWallet
     * @private
     */
    private handlerTwitchWalletGetCommand(message: TwitchWalletGetCommand): void {
        message.output.push("TwitchWalletGetCommand");
    }
}
