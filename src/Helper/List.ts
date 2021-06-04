/**
 * Utilitários para manipulação de array.
 */
export class List {
    /**
     * Reduz todos os subníveis de um array para um nível apenas.
     * @param array Array de entrada.
     */
    public static flat<T>(array: any[]): T[] {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            const values = Array.isArray(array[i]) ? this.flat(array[i]) : array[i];
            if (Array.isArray(values)) result.push(...values);
            else result.push(values);
        }
        return result;
    }

    /**
     * Remove itens duplicados no array.
     * @param array
     */
    public static unique<T>(array: T[]): T[] {
        return array.filter((item: T, index: number, arr: T[]) => arr.indexOf(item) === index);
    }
}
