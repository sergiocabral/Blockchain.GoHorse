import { Json } from './Json';
import {
  HelperObject,
  NotImplementedError,
  PrimitiveValueType
} from '@sergiocabral/helper';
import { CipherAlgorithm } from './CipherAlgorithm';
import * as crypto from 'crypto';
import { JsonValue } from './JsonValue';
import { Cipher, Decipher } from 'crypto';

export class HelperCryptography2 {
  /**
   * Algoritmo padrão.
   */
  private static defaultAlgorithm: CipherAlgorithm = 'aes-256-cbc';

  /**
   * Algoritmo padrão.
   */
  private static defaultAlgorithmKeyBytesLength = 32;

  /**
   * Vetor de inicialização.
   */
  private static defaultAlgorithmIV = Buffer.alloc(16, 0);

  /**
   * Des/criptografa o JSON.
   * @param mode Criptografa ou descriptografa
   * @param json JSON.
   * @param needToApplyEncryption Valida se é necessário aplicar criptografia.
   * @param password Senha utilizada.
   */
  public static json(
    mode: 'encrypt' | 'decrypt',
    json: Json,
    needToApplyEncryption: (
      keyPath: string,
      keyValue: PrimitiveValueType | null
    ) => boolean,
    password: string
  ): Json {
    const crypt = (
      keyPath: string,
      value: PrimitiveValueType | null
    ): PrimitiveValueType | null => {
      const keyFromPassword = crypto.scryptSync(
        password,
        keyPath,
        HelperCryptography2.defaultAlgorithmKeyBytesLength
      );

      let cipherDecipher: Cipher | Decipher;

      switch (mode) {
        case 'encrypt':
          cipherDecipher = crypto.createCipheriv(
            HelperCryptography2.defaultAlgorithm,
            keyFromPassword,
            HelperCryptography2.defaultAlgorithmIV
          );
          return (
            cipherDecipher
              .update(JSON.stringify(value), 'utf8', 'base64')
              .toString() + cipherDecipher.final('base64').toString()
          );
        case 'decrypt':
          try {
            cipherDecipher = crypto.createDecipheriv(
              HelperCryptography2.defaultAlgorithm,
              keyFromPassword,
              HelperCryptography2.defaultAlgorithmIV
            );
            return JSON.parse(
              cipherDecipher
                .update(String(value), 'base64', 'utf8')
                .toString() + cipherDecipher.final('utf8').toString()
            ) as PrimitiveValueType | null;
          } catch (error) {
            return value;
          }
        default:
          throw new NotImplementedError(`Invalid mode.`);
      }
    };

    const iterate = (jsonPart: Json, baseKeyPath = ''): Json => {
      for (const keyName in jsonPart) {
        const keyPath = `${baseKeyPath}.${keyName}`.replace(/^\./, '');
        const jsonEntry = jsonPart as Record<string, JsonValue>;
        const keyValue = jsonEntry[keyName];
        if (
          typeof keyValue === 'string' ||
          typeof keyValue === 'number' ||
          typeof keyValue === 'boolean'
        ) {
          if (needToApplyEncryption(keyPath, keyValue)) {
            jsonEntry[keyName] = crypt(keyPath, keyValue);
          }
        } else {
          iterate(keyValue as Json, keyPath);
        }
      }
      return jsonPart;
    };

    return iterate(JSON.parse(HelperObject.toText(json, 0)) as Json);
  }
}
