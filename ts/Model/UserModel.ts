import { HelperObject } from '@sergiocabral/helper';
import sha1 from 'sha1';

import { OriginOfInteraction } from '../Core/OriginOfInteraction';

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
    this.id = sha1(`${origin}${HelperObject.toText(data, 0)}`);
  }

  /**
   * Representação da instância como texto.
   */
  public toString(): string {
    return this.id;
  }
}
