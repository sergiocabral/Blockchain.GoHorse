import { TemplateString } from './TemplateString';
import { Instance } from '../Instance/Instance';
import { NotImplementedError } from '@sergiocabral/helper';

/**
 * Responsável pelas substituições de nomes de variáveis em templates de texto: npm-core
 */
export class TemplateStringCore extends TemplateString {
  /**
   * Data atual.
   */
  public readonly DATE = TemplateString.VARIABLE.DATE;

  /**
   * Hora atual.
   */
  public readonly TIME = TemplateString.VARIABLE.TIME;

  /**
   * Data e hora atual.
   */
  public readonly DATETIME = TemplateString.VARIABLE.DATETIME;

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_ID = TemplateString.VARIABLE.INSTANCE_ID;

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_DATE =
    TemplateString.VARIABLE.INSTANCE_STARTUP_DATE;

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_TIME = TemplateString.VARIABLE.TIME;

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_DATETIME = TemplateString.VARIABLE.DATETIME;

  /**
   * Converte uma chave para valor.
   */
  protected override keyToValue(key: string): string {
    switch (key) {
      case this.DATE:
        return new Date().format({ mask: 'y-M-d' });
      case this.TIME:
        return new Date().format({ mask: 'h-m-s' });
      case this.DATETIME:
        return new Date().format({ mask: 'y-M-d-h-m-s' });
      case this.INSTANCE_ID:
        return Instance.id;
      case this.INSTANCE_STARTUP_DATE:
        return Instance.startupTime.format({ mask: 'y-M-d' });
      case this.INSTANCE_STARTUP_TIME:
        return Instance.startupTime.format({ mask: 'h-m-s' });
      case this.INSTANCE_STARTUP_DATETIME:
        return Instance.startupTime.format({ mask: 'y-M-d-h-m-s' });
      default:
        throw new NotImplementedError('Invalid key: ' + key);
    }
  }
}
