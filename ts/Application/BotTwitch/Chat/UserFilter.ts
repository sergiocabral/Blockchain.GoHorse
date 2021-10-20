/**
 * Definições de filtro para usuários.
 */
export class UserFilter {
  /**
   * Todos os canais registrados.
   */
  public static ALL_USERS: string = Math.random().toString();

  /**
   * Mesmo usuário do canal.
   */
  public static OWNER_CHANNEL: string = Math.random().toString();

  /**
   * Verifica se um nome de canal é um filtro.
   */
  public static isFilter(userName: string): boolean {
    return (
      userName === UserFilter.ALL_USERS || userName === UserFilter.OWNER_CHANNEL
    );
  }
}
