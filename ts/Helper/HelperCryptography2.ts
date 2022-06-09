import { Json } from './Json';
import {
  HelperObject,
  NotImplementedError,
  PrimitiveValueType
} from '@sergiocabral/helper';
import { CipherAlgorithm } from './CipherAlgorithm';
import * as crypto from 'crypto';
import { Cipher, Decipher } from 'crypto';
import { JsonValue } from './JsonValue';
import { CryptographyDirection } from './CryptographyDirection';

export class HelperCryptography2 {
  /**
   * Algoritmo padrão.
   */
  public static defaultSymmetricAlgorithm: CipherAlgorithm = 'aes-256-cbc';

  /**
   * Algoritmo padrão.
   */
  public static defaultSymmetricAlgorithmKeyLengthInBytes = 32;

  /**
   * Vetor de inicialização.
   */
  public static defaultInitializationVector = Buffer.alloc(16, 0);

  /**
   * Des/criptografa o JSON.
   * @param mode Direção da criptografia
   * @param json JSON.
   * @param password Senha utilizada.
   * @param needToApplyEncryption Valida se é necessário aplicar criptografia.
   */
  public static json(
    mode: CryptographyDirection,
    json: Json,
    password: string,
    needToApplyEncryption?: (
      keyPath: string,
      keyValue: PrimitiveValueType | null
    ) => boolean
  ): Json {
    const crypt = (
      keyPath: string,
      value: PrimitiveValueType | null
    ): PrimitiveValueType | null => {
      const keyFromPassword = crypto.scryptSync(
        password,
        keyPath,
        HelperCryptography2.defaultSymmetricAlgorithmKeyLengthInBytes
      );

      let cipherDecipher: Cipher | Decipher;

      switch (mode) {
        case CryptographyDirection.Encrypt:
          cipherDecipher = crypto.createCipheriv(
            HelperCryptography2.defaultSymmetricAlgorithm,
            keyFromPassword,
            HelperCryptography2.defaultInitializationVector
          );
          return (
            cipherDecipher
              .update(JSON.stringify(value), 'utf8', 'base64')
              .toString() + cipherDecipher.final('base64').toString()
          );
        case CryptographyDirection.Decrypt:
          try {
            cipherDecipher = crypto.createDecipheriv(
              HelperCryptography2.defaultSymmetricAlgorithm,
              keyFromPassword,
              HelperCryptography2.defaultInitializationVector
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
          if (
            needToApplyEncryption === undefined ||
            needToApplyEncryption(keyPath, keyValue)
          ) {
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
