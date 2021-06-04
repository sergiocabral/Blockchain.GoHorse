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
    public static createDirectiry(directory: string): boolean {
        if (fs.existsSync(directory)) return true;

        const baseDirectory = path.dirname(directory);
        if (!fs.existsSync(baseDirectory)) {
            if (!this.createDirectiry(baseDirectory)) {
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
}
