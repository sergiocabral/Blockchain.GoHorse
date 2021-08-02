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
import {GetHelpCommand} from "../Command/GetHelpCommand";
import {RegisterWallerForTwitchUserCommand} from "../Command/RegisterWallerForTwitchUserCommand";
import {WhoisTwitch} from "./Section/WhoisTwitch";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {DatabaseUpdatedEvent} from "../Command/DatabaseUpdatedEvent";
import {SetTwitchProfileCreateCommand} from "../Command/SetTwitchProfileCreateCommand";

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

        Message.capture(GetHelpCommand, this.handlerGetHelpCommand.bind(this));
        Message.capture(SetTwitchProfileCreateCommand, this.handleSetTwitchProfileCreateCommand.bind(this));
        Message.capture(RegisterWallerForTwitchUserCommand, this.handlerRegisterWallerForTwitchUserCommand.bind(this));
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
     * Retorna a url para um arquivo no repositório
     * @param path Caminho do arquivo.
     * @private
     */
    private getRepositoryUrl(path: string): string {
        return `${this.coin.repositoryUrl}/blob/${this.branchName}${path}`;
    }

    /**
     * Captura de mensagem
     * @param message GetHelpCommand
     * @private
     */
    private handlerGetHelpCommand(message: GetHelpCommand): void {
        const helpPath = this.section.help.getPath(message.language);
        const helpLink = this.getRepositoryUrl(helpPath);
        message.output.push(`Access help in this link: {helpLink}`.translate().querystring({ helpLink }));
    }

    /**
     * Capturador de comando.
     * @param message TwitchProfileCreateCommand
     * @private
     */
    private handleSetTwitchProfileCreateCommand(message: SetTwitchProfileCreateCommand): void {
        const defaultQuote = "{coinName} is the future!".translate().querystring({coinName: this.coin.name});
        this.section.whoisTwitch.set(message.twitchUser, message.quote ?? defaultQuote);
        const path = this.section.whoisTwitch.getPath(message.twitchUser.name);
        const url = this.getRepositoryUrl(path);
        message.output.push('Profile updated for @{username}: {url}'.translate().querystring({
            url,
            username: message.twitchUser.name
        }));
        message.output.push(...new DatabaseUpdatedEvent("Twitch user profile updated.").request().message.output);
    }

    /**
     * Capturador de comando.
     * @param message CreateWallet
     * @private
     */
    private handlerRegisterWallerForTwitchUserCommand(message: RegisterWallerForTwitchUserCommand): void {
        this.section.wallet.setByTwitchUser(message.twitchUser);
        const wallet = this.section.wallet.getByTwitchUser(message.twitchUser);
        if (!wallet) throw new InvalidExecutionError("Wallet was created, but not found.");
        message.output.push("Wallet created for @{username}.".translate().querystring({
            username: message.twitchUser.name
        }));
        message.output.push(...new DatabaseUpdatedEvent("Wallet created.").request().message.output);
    }
}
