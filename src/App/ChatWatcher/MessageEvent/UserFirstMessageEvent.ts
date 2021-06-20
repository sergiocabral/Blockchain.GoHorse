import {Message} from "../../../Bus/Message";

/**
 * Evento quando o usuário envia a primeira mensagem.
 */
export class UserFirstMessageEvent extends Message {
    /**
     * Construtor.
     * @param channel Nome do canal.
     * @param username Nome do usuário.
     */
    public constructor(
        public channel: string,
        public username: string) {
        super();
    }
}
