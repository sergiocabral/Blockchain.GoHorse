import { NotImplementedError } from '@sergiocabral/helper';
import { TemplateString } from '@gohorse/npm-core';
import { IApplicationParameters } from './Type/IApplicationParameters';

/**
 * Responsável pelas substituições de nomes de variáveis em templates de texto: npm-application
 */
export class TemplateStringApplication extends TemplateString {
  /**
   * Nome do pacote NPM em execução.
   */
  public readonly PACKAGE_NAME = TemplateString.VARIABLE.PACKAGE_NAME;

  /**
   * Versão do pacote NPM em execução.
   */
  public readonly PACKAGE_VERSION = TemplateString.VARIABLE.PACKAGE_VERSION;

  /**
   * Nome da aplicação em execução.
   */
  public readonly APPLICATION_NAME = TemplateString.VARIABLE.APPLICATION_NAME;

  /**
   * Construtor.
   * @param applicationParameters Parâmetros relacionados a instância atual do pacote.
   */
  public constructor(
    private readonly applicationParameters: IApplicationParameters
  ) {
    super();
  }

  /**
   * Converte uma chave para valor.
   */
  protected override keyToValue(key: string): string {
    switch (key) {
      case this.PACKAGE_NAME:
        return this.applicationParameters.packageName;
      case this.PACKAGE_VERSION:
        return this.applicationParameters.packageVersion;
      case this.APPLICATION_NAME:
        return this.applicationParameters.applicationName;
      default:
        throw new NotImplementedError('Invalid key: ' + key);
    }
  }
}
