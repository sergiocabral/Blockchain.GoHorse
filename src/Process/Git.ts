import {CommandLine} from "./CommandLine";
import path from "path";
import fs from "fs";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {CommitModel} from "./Model/CommitModel";
import {InvalidExecutionError} from "../Errors/InvalidExecutionError";
import {InvalidArgumentError} from "../Errors/InvalidArgumentError";

/**
 * Manipula a execução de comandos do Git.
 */
export class Git {
    /**
     * Construtor.
     * @param directory Diretório do repositório.
     */
    public constructor(public directory: string) {
        this.gitCommandLine = new CommandLine('git', [], directory);
    }

    /**
     * Determina se o Git está instalado.
     * @private
     */
    private static isInstalledValue: boolean | null = null;

    /**
     * Determina se o Git está instalado.
     */
    public static get isInstalled(): boolean {
        if (this.isInstalledValue === null) {
            try {
                const output = (new CommandLine('git', ['--version']).execute()).join('\n');
                this.isInstalledValue = /^git/.test(output);
            } catch (error) {
                this.isInstalledValue = false;
            }
            Logger.post('Verifying if git is installed: {result}', {result: this.isInstalledValue}, LogLevel.Debug, LogContext.Git);
        }
        return this.isInstalledValue;
    }

    /**
     * Linha de comando para execução do Git.
     * @private
     */
    private gitCommandLine: CommandLine;

    /**
     * Captura um hash de commit
     * @private
     */
    private regexIsCommit: RegExp = /^[0-9a-f]{4,40}$/;

    /**
     * Testa se houve algum erro de execução no git.
     * @private
     */
    private regexGitError: RegExp = /(^fatal:|^error:|^ ! \[rejected])/m;

    /**
     * Verifica se o repositório está limpo.
     * @private
     */
    private regexNothingToCommit: RegExp = /nothing to commit/;

    /**
     * Última saída de execução do git.
     */
    private lastOutputValue: string = '';

    /**
     * Última saída de execução do git.
     */
    public get lastOutput(): string {
        return this.lastOutputValue;
    }

    /**
     * Executa um comando git.
     * @param processArguments Argumentos do git.
     * @param logMessage Mensagem de log.
     * @param logValues Valores de interpolação do log.
     * @private
     */
    private execute(processArguments: string[], logMessage: string, logValues?: any): boolean {
        this.gitCommandLine.processArguments = processArguments.filter(arg => Boolean(arg));
        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const success = !this.regexGitError.test(this.lastOutputValue);
        logValues = Object.assign({}, logValues, { result: success });
        Logger.post(logMessage, logValues, LogLevel.Debug, LogContext.Git);
        return success;
    }

    /**
     * Cria um branch.
     * @param branch branch local
     * @param remote branch remoto
     */
    public checkout(branch: string, remote?: string): boolean {
        const args = [
            'checkout',
            '-B',
            branch
        ];
        if (remote) args.push(remote);
        return this.execute(args,'Checkout (with creation) branch {1}: {0}', [branch]);
    }

    /**
     * git fetch
     * @param branch branch local
     */
    public fetch(branch: string): boolean {
        return this.execute([
            'fetch',
            'origin',
            branch
        ],'Fetched branch {1}: {0}', [branch]);
    }

    /**
     * Adiciona arquivos para o staging.
     * @param file
     */
    public add(file: string): boolean {
        return this.execute([
            'add',
            file
        ],'Added file "{1}" to staging: {0}', [file]);
    }

    /**
     * git push
     * @param branch
     */
    public push(branch?: string): boolean {
        return this.execute([
            'push',
            'origin',
            branch ? branch : 'HEAD',
        ],'Pushed changes to remote: {result}');
    }

    /**
     * git reset --hard
     */
    public reset(hard: boolean = true, to?: string | null): boolean {
        return this.execute([
            'reset',
            hard ? '--hard' : '',
            to ? to : '',
        ],'Reset hard local branch: {result}');
    }

    /**
     * git clean -df
     */
    public clean(): boolean {
        return this.execute([
            'clean',
            '-df'
        ],'Cleaned all untracked files and directories: {result}');
    }

    /**
     * Retorna o nome do branch atual.
     */
    public getCurrentBranch(): string {
        this.gitCommandLine.processArguments = [
            'branch',
            '--show-current'
        ];

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const branch = this.regexGitError.test(this.lastOutputValue) ? '' : this.lastOutputValue;
        Logger.post('Get current branch: {result}', branch, LogLevel.Debug, LogContext.Git);
        return branch;
    }

    /**
     * git rev-parse HEAD
     */
    public getCommit(parent: number|string = 0): string | null {
        const position = typeof(parent) === 'number'
            ? `HEAD~${parent}`
            : (!this.regexIsCommit.test(parent)
                ? `heads/${parent}`
                : parent);

        this.gitCommandLine.processArguments = [
            'rev-parse',
            position
        ];

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const hash = this.regexGitError.test(this.lastOutputValue) ? null : this.lastOutputValue;
        Logger.post('Get commit hash for {hash}: {result}', {hash, position}, LogLevel.Debug, LogContext.Git);
        return hash;
    }

    /**
     * Obtem o conteúdo de um commit.
     * @param commit
     */
    public getCommitContent(commit: string): CommitModel | null {
        const commitHash = this.getCommit(commit);
        if (commitHash === null) throw new InvalidExecutionError("Commit not found.");

        this.gitCommandLine.processArguments = [
            'cat-file',
            '-p',
            commitHash
        ];

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const model = this.regexGitError.test(this.lastOutputValue) ? null : new CommitModel(commitHash, this.lastOutputValue);
        Logger.post('Get commit content for {commit}: {content}', {content: model?.commitContent, commit: commitHash}, LogLevel.Debug, LogContext.Git);

        return model;
    }

    /**
     * git write-tree
     */
    public writeTree(): string {
        this.gitCommandLine.processArguments = [
            'write-tree'
        ];

        const hash = this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        Logger.post('Create work tree: {tree}', {tree: hash}, LogLevel.Debug, LogContext.Git);
        return hash;
    }

    /**
     * git gc (Garbage Collector)
     */
    public gc() {
        return this.execute([
            'gc',
            '--prune=now'
        ],'Calling garbage collector: {result}');
    }

    /**
     * git clone
     * @param repository url ou caminho do repositório.
     * @param destinationDirectory Diretório de destino.
     * @param branch Faz o clone apenas de um único branch
     * @param changeDirectoryToRepository Após o clone muda o diretório atual para o do repositório clonado.
     */
    public clone(repository: string, destinationDirectory: string, branch?: string, changeDirectoryToRepository: boolean = true): boolean {
        this.gitCommandLine.processArguments = ['clone'];

        if (branch) {
            this.gitCommandLine.processArguments.push(...[
                `-b`,
                branch,
                '--single-branch'
            ]);
        }

        this.gitCommandLine.processArguments.push(repository);

        if (destinationDirectory) {
            this.gitCommandLine.processArguments.push(destinationDirectory);
        }

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');

        if (changeDirectoryToRepository) {
            this.directory =
                this.gitCommandLine.workingDirectory =
                    fs.realpathSync(path.resolve(this.directory, path.basename(destinationDirectory)));
        }

        const success = !this.regexGitError.test(this.lastOutputValue);
        Logger.post('Clonned repository from "{repository}" to "{directory}": {result}', {result: success, repository, directory: this.directory}, LogLevel.Debug, LogContext.Git);
        return success;
    }

    /**
     * git commit
     * @param message Mensagem do commit.
     * @return Hash do commit.
     */
    public commit(message: string): boolean {
        this.gitCommandLine.processArguments = [
            'commit',
            '-m',
            `${message}`
        ];

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const success =
            !this.regexGitError.test(this.lastOutputValue) ||
            !this.lastOutputValue.includes('nothing added to commit');

        Logger.post('Committed at repository with message "{message}": {result}', { result: success, message}, LogLevel.Debug, LogContext.Git);

        return success;
    }

    /**
     * git commit-tree
     * @param message
     * @param parentsCommits
     * @param treeHash Opcional. Se não informada usa o valor do staging
     */
    public commitTree(message: string, parentsCommits: string[], treeHash?: string): string | null {
        treeHash = treeHash ? treeHash : this.writeTree();

        this.gitCommandLine.processArguments = [
            'commit-tree',
            treeHash,
            '-m',
            `${message}`
        ].concat(parentsCommits.map(parentCommitHash => `-p ${parentCommitHash}`).join(' ').split(' '));

        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const hash =
            !this.regexGitError.test(this.lastOutputValue) && this.regexIsCommit.test(this.lastOutputValue)
                ? this.lastOutputValue
                : null;

        Logger.post('Committed tree {tree} at repository with message "{message}" and parents {parentsCommits}: {commit}', {
            commit: hash,
            message: message.substr(0, (message + "\n").indexOf("\n")),
            tree: treeHash,
            parentsCommits: parentsCommits.join(", ")
        }, LogLevel.Debug, LogContext.Git);

        return hash;

    }

    /**
     * Verifica se existem alterações pendentes no repositório.
     */
    public hasChanges(): boolean {
        this.gitCommandLine.processArguments = ['status'];
        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        return !this.regexNothingToCommit.test(this.lastOutputValue);
    }

    /**
     * Incrementa uma data com ticks.
     * @param date Data no formato Git.
     * @param seconds Incremento.
     */
    public static incrementDate(date: string, seconds: number = 1): string {
        const regexDateParts = /(\d+)( [+-]\d+)/;
        const parts = date.match(regexDateParts);
        if (!parts) throw new InvalidArgumentError("Git date format is not valid.");
        const unixDate = parseInt(parts[1]) + seconds;
        const timezone = parts[2];
        return `${unixDate}${timezone}`;
    }
}
