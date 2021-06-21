import {KeyValue} from "../../../Helper/Types/KeyValue";

/**
 * Tipo dos dados para resposta automática.
 * Dados em 3 níveis: { canal: { tag: { text: [ "response" ] } } }
 */
export type AutomaticResponseType = KeyValue<KeyValue<KeyValue<string[]>>>;
