import {
  HelperNodeJs,
  HelperText,
  InvalidExecutionError,
  ITranslate,
  Logger,
  LogLevel,
  Translate,
  TranslateSet
} from '@sergiocabral/helper';

import fs from 'fs';
import path from 'path';
import { ITranslationFile } from './ITranslationFile';
import { TranslateConfiguration } from './TranslateConfiguration';
import { Definition } from '../Definition';

/**
 * Serviço de tradução.
 */
export class Translation {
  /**
   * Contexto do log.
   */
  private static logContext = 'Translation';

  /**
   * Carrega as traduções da aplicação.
   * @param configuration Configurações de idioma.
   * @param filesPrefix Prefixo dos arquivos de tradução.
   */
  public static async load(
    configuration: TranslateConfiguration,
    filesPrefix: string = Definition.TRANSLATE_FILE_PREFIX
  ): Promise<ITranslate> {
    const setAsDefault = true;
    const translate = new Translate(
      configuration.selected ??
        Translation.defaultConfiguration.selected ??
        undefined,
      configuration.fallback ??
        Translation.defaultConfiguration.fallback ??
        undefined,
      setAsDefault
    );

    const translations = Translation.getFiles(filesPrefix);
    for (const translation of translations) {
      await Translation.loadTranslation(translation, translate);
    }

    Logger.post(
      'Total translation files loaded: {count}',
      { count: translations.length },
      LogLevel.Verbose,
      Translation.logContext
    );

    return translate;
  }

  /**
   * Configuração padrão.
   */
  private static readonly defaultConfiguration = new TranslateConfiguration();

  /**
   * Carrega a lista de arquivos com traduções.
   */
  private static getFiles(filesPrefix: string): ITranslationFile[] {
    const packageJsonFiles = HelperNodeJs.getAllPreviousPackagesFiles();
    if (packageJsonFiles.length === 0) {
      throw new InvalidExecutionError('package.json file not found.');
    }

    const result: ITranslationFile[] = [];

    const regexTranslationFile = new RegExp(
      `^${HelperText.escapeRegExp(filesPrefix)}.*\\.([^.]*)\\.json$`,
      'i'
    );

    const rootDirectories = packageJsonFiles.map(packageJsonFile =>
      path.dirname(packageJsonFile)
    );
    for (const rootDirectory of rootDirectories) {
      Logger.post(
        'Reading files in the application root directory: {directoryPath}',
        { directoryPath: rootDirectory },
        LogLevel.Verbose,
        Translation.logContext
      );

      const files: ITranslationFile[] = fs
        .readdirSync(rootDirectory)
        .filter(file => regexTranslationFile.test(file))
        .map(file => {
          const filePath = path.resolve(rootDirectory, file);
          const language = (regexTranslationFile.exec(file) ?? [])[1] ?? '';

          return {
            language,
            path: filePath
          };
        });

      Logger.post(
        'Translation files found: {count}',
        { count: result.length },
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
    translation: ITranslationFile,
    service: ITranslate
  ): Promise<void> {
    return new Promise(resolve => {
      try {
        const content = fs.readFileSync(translation.path).toString();
        const translationSet = JSON.parse(content) as TranslateSet;

        service.load(
          translationSet,
          translation.language || service.selectedLanguage
        );

        Logger.post(
          'The "{filePath}" translation file was loaded for "{languageCultureName}" language.',
          {
            filePath: translation.path,
            languageCultureName: translation.language
          },
          LogLevel.Debug,
          Translation.logContext
        );
      } catch (error: unknown) {
        Logger.post(
          'An error occurred loading translation "{filePath}" file of "{languageCultureName}" language. Error: {error}',
          {
            error: HelperText.formatError(error),
            filePath: translation.path,
            languageCultureName: translation.language
          },
          LogLevel.Warning,
          Translation.logContext
        );
      }
      resolve();
    });
  }
}
