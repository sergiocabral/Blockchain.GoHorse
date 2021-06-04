import {List} from "../List";

declare global {
    /**
     * Interface para extender propriedades de Array.
     */
    interface Array<T> {
        /**
         * Reduz todos os subníveis de um array para um nível apenas.
         */
        flat<T>(): T[];

        /**
         * Remove itens duplicados no array.
         */
        unique<T>(): T[];
    }
}

Array.prototype.flat = function(): any[] {
    return List.flat(this);
}

Array.prototype.unique = function(): any[] {
    return List.unique(this);
}
