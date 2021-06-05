import fs from "fs";
import path from "path";

/**
 * Utilitário para entrada e saíde, arquivos, diretórios, etc.
 */
export class IO {
    /**
     * Cria um diretório recursivamente.
     * @param directory
     * @return Sinaliza O diretório existe ou não.
     */
    public static createDirectory(directory: string): boolean {
        if (fs.existsSync(directory)) return true;

        const baseDirectory = path.dirname(directory);
        if (!fs.existsSync(baseDirectory)) {
            if (!this.createDirectory(baseDirectory)) {
                return false;
            }
        }

        try {
            fs.mkdirSync(directory);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Remove um diretório recursivamente.
     * @param directory
     */
    public static removeDirectory(directory: string): boolean {
        try {
            const files = fs.readdirSync(directory);
            for (const file of files) {
                const filePath = path.resolve(directory, file);
                if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
                else if (!this.removeDirectory(filePath)) return false;
            }
            fs.rmdirSync(directory);
            return true;
        }
        catch(e) {
            return false;
        }
    };
}
