import { TemplateString } from './TemplateString';
import { Instance } from '../Instance/Instance';
import { NotImplementedError } from '@sergiocabral/helper';

/**
 * Nome das variáveis utilizadas em templates de queristring.
 */
export class TemplateStringCore extends TemplateString {
  /**
   * Data atual.
   */
  public readonly DATE = '{date}';

  /**
   * Hora atual.
   */
  public readonly TIME = '{time}';

  /**
   * Data e hora atual.
   */
  public readonly DATETIME = '{datetime}';

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_ID = '{instanceId}';

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_DATE = '{instanceStartupDate}';

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_TIME = '{instanceStartupTime}';

  /**
   * Id da instância em execução.
   */
  public readonly INSTANCE_STARTUP_DATETIME = '{instanceStartupDatetime}';

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

new TemplateStringCore();
