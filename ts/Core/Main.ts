import { InvalidArgumentError, Logger, LogLevel } from "@sergiocabral/helper";

import { BotTwitchApplication } from "../Application/BotTwitch/BotTwitchApplication";
import { BusApplication } from "../Application/Bus/BusApplication";
import { CoinApplication } from "../Application/Coin/CoinApplication";
import { DatabaseApplication } from "../Application/Database/DatabaseApplication";
import { MinerApplication } from "../Application/Miner/MinerApplication";
import { PusherApplication } from "../Application/Pusher/PusherApplication";

import { IApplication } from "./IApplication";

/**
 * Classe principal com o ponto de entrada da execução.
 */
export class Main {
  /**
   * Instância da aplicação que será executada.
   */
  public static get application(): IApplication {
    const application = Main.createApplication();

    if (application === undefined) {
      throw new InvalidArgumentError(
        'Invalid application name "{invalidApplicationName}". Enter a name from the list: {applicationsNames}".'.querystring(
          {
            applicationsNames: Main.applications
              .map((applicationConstructor) => applicationConstructor.name)
              .join(", "),
            invalidApplicationName: Main.getApplicationName(),
          }
        )
      );
    }

    Logger.post(
      "Selected application to run: {applicationName}",
      {
        applicationName: application.constructor.name,
      },
      LogLevel.Information,
      Main.loggerSection
    );

    return application;
  }

  /**
   * Lista de aplicações disponíveis.
   */
  private static readonly applications: Array<new() => IApplication> = [
    BotTwitchApplication,
    BusApplication,
    CoinApplication,
    DatabaseApplication,
    MinerApplication,
    PusherApplication,
  ];

  /**
   * Nome da seção para o log.
   */
  private static readonly loggerSection = Main.name;

  /**
   * Aplicação selecionada para execução.
   */
  private static createApplication(): IApplication | undefined {
    const applicationName = Main.getApplicationName();

    const applicationConstructor = Main.applications.find(
      (application) => application.name === applicationName
    );

    return applicationConstructor !== undefined
      ? new applicationConstructor()
      : undefined;
  }

  /**
   * Nome da aplicação selecionada para execução.
   */
  private static getApplicationName(): string {
    const applicationNameArgumentIndex = 2;

    return (process.argv[applicationNameArgumentIndex] ?? "").trim();
  }
}
