import { InvalidExecutionError } from "@sergiocabral/helper";
import express, { NextFunction, Request, Response } from "express";
import { Express } from "express-serve-static-core";

import { WebRequest } from "./Message/WebRequest";
import { WebserverConfiguration } from "./WebserverConfiguration";

/**
 * Inicia e gerencia um servidor web.
 */
export class Webserver {
  /**
   * Middleware para o express.
   * @param request
   * @param response
   * @param next
   * @private
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
   * Dados de configuração.
   * @private
   */
  private configuration: WebserverConfiguration;

  /**
   * Instância do servidor web.
   * @private
   */
  private server?: Express;

  /**
   * Construtor.
   * @param configuration JSON de configuração.
   */
  public constructor(configuration: unknown) {
    this.configuration = new WebserverConfiguration(configuration);
  }

  /**
   * Inicia o servidor.
   */
  public start(): void {
    if (this.server !== undefined) {
      throw new InvalidExecutionError("Webserver already started.");
    }

    this.server = express();
    this.server.use("*", Webserver.intercept);
    this.server.listen(this.configuration.port);
  }
}
