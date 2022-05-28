import {
  HelperList,
  HelperNodeJs,
  HelperText,
  InvalidExecutionError,
  ITranslate,
  Logger,
  LogLevel,
  Message,
  Translate,
  TranslateSet
} from '@sergiocabral/helper';

import fs from 'fs';
import path from 'path';
import { ITranslationFile } from './ITranslationFile';
import { TranslateConfiguration } from './TranslateConfiguration';
import { Definition } from '../Definition';
import { ReloadConfiguration } from '@gohorse/npm-core';

/**
 * Serviço de tradução.
 */
export class Translation {
  /**
   * Contexto do log.
   */
  private static logContext = 'Translation';

  /**
   * Construtor.
   * @param getConfiguration Configurações de idioma.
   * @param filesPrefix Prefixo dos arquivos de tradução.
   */
  public constructor(
    public getConfiguration: () => TranslateConfiguration,
    public filesPrefix: string = Definition.TRANSLATE_FILE_PREFIX
  ) {
    Message.subscribe(
      ReloadConfiguration,
      this.handleReloadConfiguration.bind(this)
    );
  }

  /**
   * Serviço de tradução.
   */
  private translate?: ITranslate;

  /**
   * Carrega as traduções da aplicação.
   */
  public async load(): Promise<ITranslate> {
    if (this.translate !== undefined) {
      Logger.post(
        'Discarding previous translations to perform a new load.',
        undefined,
        LogLevel.Debug,
        Translation.logContext
      );

      this.translate.deleteAll();
    }

    const setAsDefault = true;
    const configuration = this.getConfiguration();
    this.translate = new Translate(
      configuration.selected ??
        Translation.defaultConfiguration.selected ??
        undefined,
      configuration.fallback ??
        Translation.defaultConfiguration.fallback ??
        undefined,
      setAsDefault
    );

    const translations = Translation.getFiles(this.filesPrefix);
    let translationLoadedCount = 0;
    for (const translation of translations) {
      if (await Translation.loadTranslation(translation, this.translate)) {
        translationLoadedCount++;
      }
    }

    Logger.post(
      'Total translation files loaded: {count}',
      { count: translationLoadedCount },
      LogLevel.Verbose,
      Translation.logContext
    );

    return this.translate;
  }

  /**
   * Handle: ReloadConfiguration
   */
  private async handleReloadConfiguration(): Promise<void> {
    if (this.translate !== undefined) {
      await this.load();
    }
  }

  /**
   * Configuração padrão.
   */
  private static readonly defaultConfiguration = new TranslateConfiguration();

  /**
   * Carrega a lista de diretórios que serão usados na pesquisa por arquivos de tradução.
   */
  private static getDirectories(): string[] {
    const packageJsonFiles = HelperNodeJs.getAllPreviousPackagesFiles();
    if (packageJsonFiles.length === 0) {
      throw new InvalidExecutionError('package.json file not found.');
    }

    if (
      !packageJsonFiles[0].includes(Definition.DIRECTORY_NAME_FOR_NODE_MODULES)
    ) {
      throw new InvalidExecutionError(
        Definition.DIRECTORY_NAME_FOR_NODE_MODULES + ' directory not found.'
      );
    }

    let nodeModulesPath = packageJsonFiles[0];
    while (
      path.basename(nodeModulesPath) !==
      Definition.DIRECTORY_NAME_FOR_NODE_MODULES
    ) {
      nodeModulesPath = path.dirname(nodeModulesPath);
    }

    const goHorsePath = `${nodeModulesPath}${path.sep}${Definition.DIRECTORY_NAME_FOR_GOHORSE}`;
    if (!fs.existsSync(goHorsePath)) {
      throw new InvalidExecutionError(
        Definition.DIRECTORY_NAME_FOR_GOHORSE + ' directory not found.'
      );
    }

    const directories = fs
      .readdirSync(goHorsePath)
      .map(entry => `${goHorsePath}${path.sep}${entry}`)
      .filter(path => fs.statSync(path).isDirectory());

    directories.push(fs.realpathSync(process.cwd()));

    return HelperList.unique(directories);
  }

  /**
   * Carrega a lista de arquivos com traduções.
   */
  private static getFiles(filesPrefix: string): ITranslationFile[] {
    const result: ITranslationFile[] = [];

    const regexTranslationFile = new RegExp(
      `^${HelperText.escapeRegExp(filesPrefix)}.*\\.([^.]*)\\.json$`,
      'i'
    );

    for (const directory of this.getDirectories()) {
      Logger.post(
        'Reading files in the directory: {directoryPath}',
        { directoryPath: directory },
        LogLevel.Verbose,
        Translation.logContext
      );

      const files: ITranslationFile[] = fs
        .readdirSync(directory)
        .filter(file => regexTranslationFile.test(file))
        .map(file => {
          const filePath = path.resolve(directory, file);
          const language = (regexTranslationFile.exec(file) ?? [])[1] ?? '';

          return {
            language,
            path: filePath
          };
        });

      Logger.post(
        'Translation files found: {count}',
        { count: files.length },
        LogLevel.Verbose,
        Translation.logContext
      );

      result.push(...files);
    }

    return result;
  }

  /**
   * Carrega as traduções da aplicação.
   */
  private static async loadTranslation(
    translationFile: ITranslationFile,
    service: ITranslate
  ): Promise<boolean> {
    return new Promise(resolve => {
      let success = false;
      try {
        const content = fs.readFileSync(translationFile.path).toString();
        const translationSet = JSON.parse(content) as TranslateSet;

        service.load(
          translationSet,
          translationFile.language || service.selectedLanguage
        );

        success = true;

        Logger.post(
          'The "{filePath}" translation file with {sizeBytes} bytes was loaded for "{languageCultureName}" language.',
          {
            filePath: translationFile.path,
            sizeBytes: fs.statSync(translationFile.path).size,
            languageCultureName: translationFile.language
          },
          LogLevel.Debug,
          Translation.logContext
        );
      } catch (error: unknown) {
        Logger.post(
          'An error occurred loading translation "{filePath}" file of "{languageCultureName}" language. Error: {error}',
          {
            error: HelperText.formatError(error),
            filePath: translationFile.path,
            languageCultureName: translationFile.language
          },
          LogLevel.Warning,
          Translation.logContext
        );
      }
      resolve(success);
    });
  }
}
