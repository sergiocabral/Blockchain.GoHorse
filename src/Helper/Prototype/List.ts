import {List} from "../List";

declare global {
    /**
     * Interface para extender propriedades de Array.
     */
    interface Array<T> {
        /**
         * Reduz todos os subníveis de um array para um nível apenas.
         */
        flat<TResult>(): TResult[];
    }
}

Array.prototype.flat = function(): any[] {
    return List.flat(this);
}
