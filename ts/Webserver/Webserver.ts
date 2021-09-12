import { InvalidExecutionError } from "@sergiocabral/helper";
import { default as express, NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { WebRequest } from "./Message/WebRequest";
import { WebserverConfiguration } from "./WebserverConfiguration";

/**
 * Inicia e gerencia um servidor web.
 */
export class Webserver {
  /**
   * Middleware para o express.
   * @param request Requisição.
   * @param response Resposta
   * @param next Próximo middleware
   */
  private static intercept(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    void new WebRequest(request.baseUrl).sendAsync();
    next();
  }

  /**
   * Instância do servidor web.
   */
  private server?: Express;

  /**
   * Construtor.
   * @param configuration JSON de configuração.
   */
  public constructor(private readonly configuration: WebserverConfiguration) {}

  /**
   * Inicia o servidor.
   */
  public start(): void {
    if (this.server !== undefined) {
      throw new InvalidExecutionError("Webserver already started.");
    }

    this.server = express();
    this.server.use("*", Webserver.intercept.bind(this));
    this.server.listen(this.configuration.port);
  }
}
