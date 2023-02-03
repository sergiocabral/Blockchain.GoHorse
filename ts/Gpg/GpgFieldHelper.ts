import os from 'os';

/**
 * Utilitário envolvendo parâmetro de/para campos GPG.
 */
export class GpgFieldHelper {
  /**
   * Formata uma data para uso como parâmetro.
   */
  public static toDate(date: Date): string {
    return date.toISOString().replace(/T.*/, '');
  }

  /**
   * Cria um arquivo para batch
   * @param input Mapa com `chave: valor` ou `%chave valor`
   */
  public static toBatchFile(input: Map<string, string | undefined>): string {
    return Array.from(input)
      .map(entry => {
        const key = entry[0];
        const value = entry[1];
        if (value === undefined) {
          return key;
        } else if (key.startsWith('%')) {
          return `${key} ${value}`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join(os.EOL);
  }
}
