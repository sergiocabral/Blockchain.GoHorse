import { JsonValue } from './JsonValue';

/**
 * Valor possível para JSON.
 */
export type Json = Record<string, JsonValue> | Array<JsonValue>;
