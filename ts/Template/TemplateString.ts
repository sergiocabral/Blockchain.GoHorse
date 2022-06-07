import {
  HelperText,
  InvalidDataError,
  InvalidExecutionError,
  ShouldNeverHappenError
} from '@sergiocabral/helper';

/**
 * Nome das variáveis utilizadas em templates de queristring.
 */
export abstract class TemplateString {
  /**
   * Instâncias
   */
  private static readonly instances: TemplateString[] = [];

  /**
   * Retorna a instância correspondente ao tipo.
   */
  public static getInstance<TTemplateString extends TemplateString>(
    typeConstructor: new () => TTemplateString
  ): TTemplateString {
    for (const instance of TemplateString.instances) {
      if (instance.constructor.name === typeConstructor.name) {
        return instance as TTemplateString;
      }
    }
    throw new InvalidExecutionError(
      'Instance of type is not present: ' + typeConstructor.name
    );
  }

  /**
   * Faz as devidas substituições em uma string de entrada.
   */
  public static replace(template: string): string {
    const regexValidKeyTemplate = /^\{.+}$/;
    for (const instance of TemplateString.instances) {
      for (const key of instance.keys) {
        const keyIntoTemplate = instance[key as keyof TemplateString];
        if (!regexValidKeyTemplate.test(keyIntoTemplate)) {
          throw new InvalidDataError('Key template must be between { and }.');
        }
        if (template.includes(keyIntoTemplate)) {
          template = HelperText.replaceAll(
            template,
            keyIntoTemplate,
            instance.keyToValue(key)
          );
        }
      }
    }
    return template;
  }

  /**
   * Chaves presentes na instância.
   */
  private keys: string[];

  /**
   * Construtor.
   */
  public constructor() {
    TemplateString.instances.push(this);
    this.keys = this.getKeys();
  }

  /**
   * Converte uma chave para valor.
   */
  protected abstract keyToValue(key: string): string;

  /**
   * Carrega as chaves da instância.
   */
  private getKeys() {
    const regexConstrutorBody = /(?<=constructor[^{]*\{)[^}]*/s;
    const construtorBody = this.constructor
      .toString()
      .match(regexConstrutorBody);
    if (construtorBody === null || construtorBody.length !== 1) {
      throw new ShouldNeverHappenError();
    }

    const regexProperty = /(?<=this\.)[A-Z\d_]+/gs;
    const keys = construtorBody[0].match(regexProperty);
    if (keys === null) {
      throw new ShouldNeverHappenError();
    }

    return keys;
  }
}
