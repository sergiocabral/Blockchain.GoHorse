import {IModel} from "./IModel";

/**
 * Interface para modelo de dados.
 */
export interface IModelPrintable extends IModel {
    /**
     * Representação do problema como texto.
     */
    asText(): string;
}
