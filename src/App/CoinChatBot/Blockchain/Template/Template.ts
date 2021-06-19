import path from "path";
import fs from "fs";
import {KeyValue} from "../../../../Helper/Types/KeyValue";
import {InvalidExecutionError} from "../../../../Errors/InvalidExecutionError";
import {TemplateFiles} from "./TemplateFiles";
import {TemplateKey} from "./TemplateKey";

/**
 * Carrega um template de texto.
 */
export abstract class Template {

    /**
     * Contrutor.
     * @param templateName
     */
    public constructor(public readonly templateName: TemplateFiles) {
    }

    /**
     * Extensão padrão dos arquivos.
     * @private
     */
    public static readonly extension: string = "txt";

    /**
     * Captura a chave e comprimento.
     * @private
     */
    private static regexKeyAndLength: RegExp = /{(\d+|)(?::|)([\w\-]+)(?::|)(\d+|)[^}]*}/;

    /**
     * Conteúdo do arquivo.
     */
    public abstract get content(): string;

    /**
     * Conteúdo do template.
     */
    public get templateContent(): string {
        return Template.templateContent(this.templateName);
    }

    /**
     * Cache dos valores de arquivos lidos.
     * @private
     */
    private static templateContentValues: KeyValue = { }

    /**
     * Conteúdo do template
     * @param templateName Nome do template.
     */
    public static templateContent(templateName: TemplateFiles): string {
        if (!this.templateContentValues[templateName]) {
            const filePath = path.resolve(__dirname, `${templateName}Template.${Template.extension}`);
            this.templateContentValues[templateName] = Buffer.from(fs.readFileSync(filePath)).toString();
        }
        return this.templateContentValues[templateName];
    }

    /**
     * Aplica os parâmetros no conteúdo.
     * @param parameters Lista de parâmetros.
     */
    public set(parameters: KeyValue): string {
        return Template.set(this.templateContent, parameters);
    }

    /**
     * Aplica os parâmetros no conteúdo.
     * @param templateContent Conteúdo do template.
     * @param parameters Lista de parâmetros.
     */
    public static set(templateContent: string, parameters: KeyValue): string {
        const keys = Template
            .extractKeys(templateContent)
            .sort((a, b) => a.indexOf > b.indexOf ? -1 : +1);
        for (const key of keys) {
            let keyValue = parameters[key.name] ?? '';
            if (key.padStart !== null) keyValue = keyValue.padStart(key.padStart);
            if (key.padEnd !== null) keyValue = keyValue.padEnd(key.padEnd);
            templateContent = templateContent.substr(0, key.indexOf) + keyValue + templateContent.substr(key.indexOf + key.expression.length);
        }
        return templateContent;
    }

    /**
     * Lê os parâmetros do conteúdo.
     * @param content Conteúdo do arquivo.
     */
    public get(content: string): KeyValue {
        return Template.get(this.templateContent, content);
    }

    /**
     * Lê os parâmetros do conteúdo.
     * @param templateContent Conteúdo do template.
     * @param content Conteúdo do arquivo.
     */
    public static get(templateContent: string, content: string): KeyValue {
        const result: KeyValue = { };

        const templateLines = templateContent.split('\n');
        const contentLines = content.split('\n');
        for (let i = 0; i < templateLines.length && i < contentLines.length; i++) {
            const templateLine = templateLines[i];
            const contentLine = contentLines[i];
            const keys = Template.extractKeys(templateLine);
            for (const key of keys) {
                const length =
                    key.padStart === null && key.padEnd === null
                        ? undefined
                        : (key.padStart ?? 0) + (key.padEnd ?? 0);
                result[key.name] = contentLine.substr(key.indexOf, length).trim();
            }
        }
        return result;
    }

    /**
     * Extrai as chaves em um template.
     * @param template
     * @private
     */
    private static extractKeys(template: string): TemplateKey[] {
        const result: TemplateKey[] = [];
        let keyMatch: RegExpMatchArray | null;
        let shift: number = 0;
        while (keyMatch = template.substr(shift).match(Template.regexKeyAndLength)) {
            if (!keyMatch?.length || keyMatch.index === undefined) throw new InvalidExecutionError("Key name in template is wrong.");
            result.push({
                name: keyMatch[2],
                padStart: keyMatch[1] ? Number(keyMatch[1]) : null,
                padEnd: keyMatch[3] ? Number(keyMatch[3]) : null,
                indexOf: shift + keyMatch.index,
                expression: keyMatch[0]
            });
            shift += keyMatch.index + keyMatch[0].length;
        }
        return result;
    }

}
