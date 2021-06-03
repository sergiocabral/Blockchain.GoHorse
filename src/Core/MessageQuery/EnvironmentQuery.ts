import {Message} from "../../Bus/Message";
import {Environment} from "../Environment/Environment";
import {EmptyValueError} from "../../Errors/EmptyValueError";

/**
 * Obter os dados do ambiente.
 */
export class EnvironmentQuery extends Message {

    /**
     * Informação de configuração do ambiente.
     * @private
     */
    private environmentValue: Environment | null = null;

    /**
     * Informação de configuração do ambiente.
     */
    public get environment(): Environment {
        if (this.environmentValue === null) throw new EmptyValueError('EnvironmentQuery');
        return this.environmentValue;
    };

    /**
     * Informação de configuração do ambiente.
     * @param environmentValue
     */
    public set environment(environmentValue: Environment) {
        this.environmentValue = environmentValue;
    }
}
