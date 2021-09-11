import { Message } from "@sergiocabral/helper";

/**
 * Requisição web.
 */
export class WebRequest extends Message {
  /**
   * Construtor.
   * @param path Caminho da requisição.
   */
  public constructor(public readonly path: string) {
    super();
  }
}
