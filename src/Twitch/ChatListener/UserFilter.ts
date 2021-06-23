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
     * @param userName
     */
    public static isFilter(userName: string): boolean {
        return (
            userName === this.ALL_USERS ||
            userName === this.OWNER_CHANNEL
        );
    }
}
