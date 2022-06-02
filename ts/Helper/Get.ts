import { HelperCryptography } from '@sergiocabral/helper';
import { GlobalDefinition } from '../GlobalDefinition';

/**
 * Obtem informações passando sobre determinados critérios.
 */
export class Get {
  /**
   * Obtem um valor tipo senha
   */
  public static password(input: string): string {
    if (input === GlobalDefinition.WELL_KNOWN_PASSWORD) {
      const hash = HelperCryptography.hashSha256(input);
      input = Buffer.from(hash, 'hex').toString('base64');
    }
    return input;
  }
}
