import {BaseSection} from "./BaseSection";
import {HelpTemplate} from "../../Template/HelpTemplate";
import fs from "fs";
import path from "path";
import {InvalidExecutionError} from "../../../../../Errors/InvalidExecutionError";
import {Definition} from "../../Definition";

/**
 * Seção do banco de dados: Arquivo de ajuda.
 */
export class HelpSection extends BaseSection {
    /**
     * Expressão regular para extrair o nome do idioma do arquivo.
     * @private
     */
    private regexExtractLanguage = /[\w\-]+(?=\.[^.]*$)/;

    /**
     * Cria a estrutura inicial
     */
    public set(): void {
        this.files.forEach(filePath => {
            const language = (filePath.match(this.regexExtractLanguage) || [])[0];
            if (language) {
                const fileContent = fs.readFileSync(filePath).toString();
                const helpTemplate = new HelpTemplate(this.database.coin.name, fileContent);
                this.database.persistence.write('/docs/{language}/help', {language}, helpTemplate.content, true);
            }
        });
    }

    /**
     * Retorna o caminho do arquivo de ajuda.
     * @param language
     */
    public getPath(language?: string): string {
        language = this.matchLanguage(language);
        return this.database.persistence.path('/docs/{language}/help', {language});
    }

    /**
     * Determina o idioma correpondente.
     * @param language Idioma.
     * @private
     */
    private matchLanguage(language?: string): string {
        language = language || Definition.DefaultLanguage;

        const languages4letters = this.languages;
        const languages4lettersSlugify = languages4letters.map(language4letters => language4letters.slug());
        const language4lettersSlugify = language.slug();

        for (let i = 0; i < languages4lettersSlugify.length; i++) {
            if (languages4lettersSlugify[i] === language4lettersSlugify) return languages4letters[i];
        }

        const languages2letters = languages4letters.map(language4letters => language4letters.substr(0, 2));
        const languages2lettersSlugify = languages2letters.map(language4letters => language4letters.slug());
        const language2lettersSlugify = language4lettersSlugify.substr(0, 2);

        for (let i = 0; i < languages2lettersSlugify.length; i++) {
            if (languages2lettersSlugify[i] === language2lettersSlugify) return languages4letters[i];
        }

        return Definition.FallbackLanguage;
    }

        /**
         * Lista de arquivos de ajuda.
         */
    private filesValue: string[] | null = null;

    /**
     * Lista de arquivos de ajuda.
     * @private
     */
    private get files(): string[] {
        if (this.filesValue === null) {
            let directory = path.resolve(__dirname, "../../Help");
            if (!fs.existsSync(directory)) {
                throw new InvalidExecutionError("Help directory path not found: " + directory);
            }
            directory = fs.realpathSync(directory);
            this.filesValue = fs
                .readdirSync(directory)
                .map(fileName => path.resolve(directory, fileName))
                .filter(file => fs.statSync(file).isFile());
        }
        return this.filesValue;
    }

    /**
     * Idiomas disponíveis.
     * @private
     */
    private get languages(): string[] {
        return this
            .files
            .map(filePath => (filePath.match(this.regexExtractLanguage) || [])[0])
            .filter(language => Boolean(language));
    }
}
