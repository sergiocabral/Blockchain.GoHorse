/**
 * Valor possível para JSON.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [x: string]: JsonValue }
  | Array<JsonValue>;
