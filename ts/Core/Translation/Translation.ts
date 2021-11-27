import {
  ITranslate,
  Logger,
  LogLevel,
  Translate,
  TranslateSet,
} from "@sergiocabral/helper";
import fs from "fs";
import path from "path";

import { Argument } from "../Argument";

import { ITranslationFile } from "./ITranslationFile";
import { TranslateConfiguration } from "./TranslateConfiguration";

/**
 * Serviço de tradução.
 */
export class Translation {
  /**
   * Carrega as traduções da aplicação.
   * @param configuration Configurações de idioma.
   */
  public static async load(
    configuration: TranslateConfiguration
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

    const translations = Translation.getFiles();
    for (const translation of translations) {
      await Translation.loadTranslation(translation, translate);
    }

    return translate;
  }

  /**
   * Configuração padrão.
   */
  private static readonly defaultConfiguration = new TranslateConfiguration();

  /**
   * Carrega a lista de arquivos com traduções.
   */
  private static getFiles(): ITranslationFile[] {
    const regexTranslationFile = /^translation(\..*|)\.json/i;
    const rootDirectory = Argument.getRootDirectory();

    return fs
      .readdirSync(rootDirectory)
      .filter((file) => regexTranslationFile.test(file))
      .map((file) => {
        const filePath = path.resolve(rootDirectory, file);
        const language = (
          (regexTranslationFile.exec(file) ?? [])[1] ?? ""
        ).substring(1);

        return {
          language,
          path: filePath,
        };
      });
  }

  /**
   * Carrega as traduções da aplicação.
   */
  private static async loadTranslation(
    translation: ITranslationFile,
    service: ITranslate
  ): Promise<void> {
    return new Promise((resolve) => {
      try {
        const content = fs.readFileSync(translation.path).toString();
        const translationSet = JSON.parse(content) as TranslateSet;

        service.load(
          translationSet,
          translation.language || service.selectedLanguage
        );

        Logger.post(
          'The "{file}" translation file was loaded for "{language}" language',
          {
            file: translation.path,
            language: translation.language,
          },
          LogLevel.Verbose,
          Translation.name
        );
      } catch (error: unknown) {
        Logger.post(
          'An error occurred loading translation "{file}" file of "{language}" language. Error: {error}',
          {
            error,
            file: translation.path,
            language: translation.language,
          },
          LogLevel.Warning,
          Translation.name
        );
      }
      resolve();
    });
  }
}
