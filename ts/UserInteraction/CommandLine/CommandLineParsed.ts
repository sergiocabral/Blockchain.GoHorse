/**
 * Representa um comando de linha.
 */
export class CommandLineParsed {
  /**
   * ConstructorConstrutor.
   * @param command Comando.
   * @param args Argumentos.
   */
  public constructor(
    public readonly command: string,
    public readonly args: string[]
  ) {}

  // TODO: Implementar captura de parâmetro por nome, por ex: --name ou --ammount etc.
}
