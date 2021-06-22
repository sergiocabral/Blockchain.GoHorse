import {Database} from "../Database";

/**
 * Seção do banco de dados.
 */
export class BaseSection {
    /**
     * Construtor.
     * @param database Banco de dados.
     * @protected
     */
    public constructor(protected database: Database) {

    }
}
