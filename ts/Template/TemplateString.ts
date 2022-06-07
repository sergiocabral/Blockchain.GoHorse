import {
  HelperText,
  InvalidDataError,
  InvalidExecutionError,
  Logger,
  LogLevel
} from '@sergiocabral/helper';
import { Definition } from '../Definition';

/**
 * Responsável pelas substituições de nomes de variáveis em templates de texto.
 */
export abstract class TemplateString {
  /**
   * Contexto para logger.
   */
  public static logContext = 'TemplateString';

  /**
   * Instâncias
   */
  private static readonly instances: TemplateString[] = [];

  /**
   * Lista unificada para todos os pacotes contendo nomes de variáveis usadas em template de texto.
   */
  public static VARIABLE = Definition.TEMPLATE_STRING_VARIABLES;

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
            instance.keyToValue(keyIntoTemplate)
          );
        }
      }
    }
    return template;
  }

  /**
   * Chaves presentes na instância.
   */
  private readonly keys: string[];

  /**
   * Construtor.
   */
  public constructor() {
    if (
      TemplateString.instances.some(
        instance => instance.constructor === this.constructor
      )
    ) {
      throw new InvalidExecutionError('Cannot created more than one time.');
    }
    TemplateString.instances.push(this);
    this.keys = this.getKeys();
    Logger.post(
      'Created "{className}" class for template string with {count} keys: {keyList}',
      {
        className: this.constructor.name,
        count: this.keys.length,
        keyList: this.keys
      },
      LogLevel.Debug,
      TemplateString.logContext
    );
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
    if (construtorBody !== null && construtorBody.length === 1) {
      const regexProperty = /(?<=this\.)[A-Z\d_]+/gs;
      return construtorBody[0].match(regexProperty) ?? [];
    }
    return [];
  }
}
