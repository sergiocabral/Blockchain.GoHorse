import { HelperObject } from "@sergiocabral/helper";
import md5 from "md5";

import { OriginOfInteraction } from "../OriginOfInteraction";

/**
 * Representação de usuários.
 */
export class UserModel {
  /**
   * Identificador único.
   */
  public readonly id: string;

  /**
   * Construtor.
   */
  public constructor(
    private readonly origin: OriginOfInteraction,
    private readonly data: Record<string, unknown>
  ) {
    this.id = md5(`${origin}${HelperObject.toText(data, 0)}`);
  }

  /**
   * Representação da instância como texto.
   */
  public toString(): string {
    return this.id;
  }
}
