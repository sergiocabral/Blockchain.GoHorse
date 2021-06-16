import {CommandLine} from "./CommandLine";
import path from "path";
import fs from "fs";
import {Logger} from "../Log/Logger";
import {LogLevel} from "../Log/LogLevel";
import {LogContext} from "../Log/LogContext";
import {IO} from "../Helper/IO";
import {CommitModel} from "./Model/CommitModel";
import {InvalidExecutionError} from "../Errors/InvalidExecutionError";

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
            Logger.post('Verifying if git is installed: {0}', [this.isInstalledValue], LogLevel.Debug, LogContext.Git);
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
    private regexGitError: RegExp = /^fatal:/m;

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
    private execute(processArguments: string[], logMessage: string, logValues: any[] = []): boolean {
        this.gitCommandLine.processArguments = processArguments.filter(arg => Boolean(arg));
        this.lastOutputValue = this.gitCommandLine.execute().join('\n');
        const success = !this.regexGitError.test(this.lastOutputValue);
        logValues.unshift(success);
        Logger.post(logMessage, logValues, LogLevel.Debug, LogContext.Git);
        return success;
    }

    /**
     * Verifica se um branch existe.
     * @param branch
     */
    public branchExists(branch: string): boolean {
        return this.execute([
            'fetch',
            'origin',
            branch
        ],'Verified if branch {1} does exists: {0}', [branch]);
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
     */
    public push(): boolean {
        return this.execute([
            'push',
            '--all'
        ],'Pushed changes to remote: {0}');
    }

    /**
     * git pull
     */
    public pull(): boolean {
        return this.execute([
            'pull'
        ],'Pulled changes to local: {0}');
    }

    /**
     * git reset --hard
     */
    public reset(hard: boolean = true, to?: string | null): boolean {
        return this.execute([
            'reset',
            hard ? '--hard' : '',
            to ? to : '',
        ],'Reset hard local branch: {0}');
    }

    /**
     * git clean -df
     */
    public clean(): boolean {
        return this.execute([
            'clean',
            '-df'
        ],'Cleaned all untracked files and directories: {0}');
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
        Logger.post('Get commit hash for {1}: {0}', [hash, position], LogLevel.Debug, LogContext.Git);
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
        Logger.post('Get commit content for {1}: {0}', [model?.commitContent, commitHash], LogLevel.Debug, LogContext.Git);

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
        Logger.post('Create work tree: {0}', [hash], LogLevel.Debug, LogContext.Git);
        return hash;
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
        Logger.post('Clonned repository from "{1}" to "{2}": {0}', [success, repository, this.directory], LogLevel.Debug, LogContext.Git);
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

        Logger.post('Committed at repository with message "{1}": {0}', [success, message], LogLevel.Debug, LogContext.Git);

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

        Logger.post('Committed tree {2} at repository with message "{1}" and parents {3}: {0}', [
            hash, message.substr(0, (message + "\n").indexOf("\n")), treeHash,
            parentsCommits.join(", ")
        ], LogLevel.Debug, LogContext.Git);

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
     * Apaga arquivos e diretórios do repositório atual
     * @param except Exceto.
     */
    public emptyDirectory(except: string[]): boolean {
        const items = fs.readdirSync(this.directory);
        for (const item of items) {
            if (item === '.git' || except.includes(item)) continue;
            if (fs.statSync(item).isFile()) fs.unlinkSync(item);
            else IO.removeDirectory(item);
        }

        if (!this.hasChanges()) return true;

        const success = this.add("*") && this.commit("Removed directory contents.");

        Logger.post('Removed directory contents: {0}', [success], LogLevel.Debug, LogContext.Git);

        return success;
    }
}
