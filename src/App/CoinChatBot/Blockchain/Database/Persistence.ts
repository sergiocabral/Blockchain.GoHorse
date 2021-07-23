import path from "path";
import {IO} from "../../../../Helper/IO";
import {Definition} from "../Definition";
import {DatabasePathType} from "./DatabasePathType";
import fs from "fs";
import {ShouldNeverHappen} from "../../../../Errors/ShouldNeverHappen";

/**
 * Manipulador de entrada e saída no disco.
 */
export class Persistence {
    /**
     * Construtor.
     * @param directory Diretório do banco de dados.
     */
    public constructor(private readonly directory: string) {
    }

    /**
     * Monta a estrutura do diretório.
     * @param filePath
     * @param fileReplacement Valores para substituição.
     * @private
     */
    private ensurePath(filePath: string, fileReplacement?: any): string {
        const parts = filePath.querystring(fileReplacement).split('/').filter(a => Boolean(a));
        const realpath = path.resolve(this.directory, ...parts);
        const dirname = path.dirname(realpath);
        IO.createDirectory(dirname);
        return `${realpath}.${Definition.FileExtension}`;
    }

    /**
     * Lê o conteúdo de um arquivo.
     * @param file Arquivo.
     * @param fileReplacement Parâmetros de substituição no file.
     * @param content Conteúdo do arquivo.
     * @param overwrite Sobreescreve o arquivo.
     * @private
     */
    public write(file: DatabasePathType, fileReplacement: any = undefined, content: string, overwrite: boolean = false): boolean {
        const realpath = this.ensurePath(file, fileReplacement);
        if (overwrite || !fs.existsSync(realpath)) {
            fs.writeFileSync(realpath, content.replaceAll('\r', ''));
            return true;
        }
        return false;
    }

    /**
     * Lê o conteúdo de um arquivo.
     * @param file Arquivo.
     * @param fileReplacement Parâmetros de substituição no file.
     * @param fallback Valor a ser retornado se o arquivo não existir.
     * @param autoCreate Cria o arquivo se não existir.
     * @private
     */
    public read(file: DatabasePathType, fileReplacement: any = undefined, fallback?: (() => string) | string, autoCreate?: boolean): string | null {
        const realpath = this.ensurePath(file, fileReplacement);
        let content: string | null = null;
        if (fs.existsSync(realpath)) {
            content = fs.readFileSync(realpath).toString();
        } else if (fallback) {
            content = typeof(fallback) === 'function' ? fallback() : fallback;
            if (autoCreate) {
                fs.writeFileSync(realpath, content);
            }
        }
        return content;
    }

    /**
     * Converte um formato texto para data.
     * @param date
     */
    public convertTextToDate(date: string): Date {
        const regexDateParts = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
        const dateParts = date.match(regexDateParts);
        if (!dateParts) throw new ShouldNeverHappen();
        return new Date(Date.UTC(
            Number(dateParts[1]),
            Number(dateParts[2]),
            Number(dateParts[3]),
            Number(dateParts[4]),
            Number(dateParts[5]),
            Number(dateParts[6]),
            Number(dateParts[7])));
    }

    /**
     * Converte data para um formato texto.
     * @param date
     */
    public convertDateToText(date: Date): string {
        return date.format({ mask: "y-M-d h:m:s.z", useUTC: true });
    }
}
