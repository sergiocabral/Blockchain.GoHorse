import {UserTagsType} from "./UserTagsType";
import {UserTagsRawType} from "./UserTagsRawType";

/**
 * Dados para tags do usuário.
 */
export class UserTagsList {

    /**
     * Construtor.
     * @param data Tipo dos dados para tags do usuário
     */
    public constructor(data: UserTagsRawType) {
        this.data = this.normalize(data);
    }

    /**
     * Representação dos separadores das tags.
     */
    public static regexTagsSeparator: RegExp = /[,;|\s]+/;

    /**
     * Dados de configuração.
     */
    public data: UserTagsType;

    /**
     * Normaliza os dados: sem acentuação, minúscula, etc.
     * @param data
     * @private
     */
    private normalize(data: UserTagsRawType): UserTagsType {
        const sanitized = { } as UserTagsType;

        Object
            .keys(data)
            .forEach(username =>
                sanitized[username.slug()] =
                    data[username]
                        .split(UserTagsList.regexTagsSeparator)
                        .map(tag => tag.slug())
                        .filter(tag => Boolean(tag))
                        .sort()
                        .unique());

        return sanitized;
    }

    /**
     * Lista de usuários.
     */
    public getUsers(): string[] {
        return Object
            .keys(this.data)
            .sort();
    }

    /**
     * Lista todas as tags
     */
    public getAllTags(): string[] {
        const result: string[] = [];

        Object
            .keys(this.data)
            .forEach(username => result.push(...this.data[username]));

        return (result.unique() as string[]).sort();
    }

    /**
     * Lista de tags do usuário.
     * @param username
     */
    public getUserTags(username: string): string[] {
        username = username.slug();
        return ([] as string[]).concat(this.data[username] || []);
    }

}
