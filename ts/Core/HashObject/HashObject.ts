import { HelperObject } from "@sergiocabral/helper";
import sha1 from "sha1";

import { IHashObjectData } from "./IHashObjectData";

// TODO: Subir essa funcionalidade para o pacote npm @sergiocabral/helpers

/**
 * Associa objetos (baseado em JSON.stringify) a valores.
 */
export class HashObject<TValue> {
  /**
   * Resulta em um hash da informação.
   */
  private static hash(value: unknown): string {
    return sha1(HelperObject.toText(value, 0));
  }

  /**
   * Lista de chave e valor.
   */
  private list: Array<IHashObjectData<TValue>> = [];

  /**
   * Construtor.
   * @param defaultExpirationInMilliseconds Tempo padrão usado como valor de expiração quando não informado.
   */
  public constructor(public defaultExpirationInMilliseconds?: number) {}

  /**
   * Retorna o valor associado a um objeto.
   * @param object Objeto usado como chave (key) na associação.
   */
  public get(object: unknown): TValue | undefined {
    this.discardExpired();
    const key = HashObject.hash(object);

    return this.list.find((data) => data.key === key)?.value;
  }

  /**
   * Atribui um valor a um objeto.
   * @param object Objeto usado como chave (key) na associação.
   * @param value Valor associado.
   * @param expirationInMilliseconds Quando informado, a informação é apagada depois de um tempo.
   */
  public set(
    object: unknown,
    value: TValue,
    expirationInMilliseconds?: number
  ): void {
    this.discardExpired();

    expirationInMilliseconds =
      expirationInMilliseconds ?? this.defaultExpirationInMilliseconds;

    const key = HashObject.hash(object);
    const data: IHashObjectData<TValue> = {
      expirationTime:
        expirationInMilliseconds !== undefined
          ? new Date().getTime() + expirationInMilliseconds
          : undefined,
      key,
      value,
    };

    const existingIndex = this.list.findIndex((d) => d.key === key);
    if (existingIndex < 0) {
      this.list.push(data);
    } else {
      this.list[existingIndex] = data;
    }
  }

  /**
   * Remove os itens expirados.
   */
  private discardExpired(): void {
    const now = new Date().getTime();
    for (let index = this.list.length - 1; index >= 0; index -= 1) {
      const data = this.list[index];
      const expired =
        data.expirationTime !== undefined && data.expirationTime <= now;
      if (expired) {
        this.list.splice(index, 1);
      }
    }
  }
}
