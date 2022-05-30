import { InvalidArgumentError } from '@sergiocabral/helper';
import { Definition } from '../Definition';

/**
 * Gerador de informações.
 */
export class Generate {
  /**
   * Id aleatório.
   * @param prefix Prefixo do id.
   * @param length COmprimento.
   */
  public static id(
    prefix = '',
    length = Definition.GENERATE_ID_DEFAULT_LENGTH
  ): string {
    if (length <= 0) {
      throw new InvalidArgumentError('Length must be greater than zero.');
    }
    const generate = () =>
      Buffer.from(Math.random().toString())
        .toString('base64')
        .replace(/[\W_]/g, '')
        .substring(10, 15);

    let id = '';
    while (id.length < length) {
      id += generate();
    }

    return prefix + id.substring(0, length);
  }
}
