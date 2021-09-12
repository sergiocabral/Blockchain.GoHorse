import {
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";

import { BotTwitchApplication } from "../Application/BotTwitch/BotTwitchApplication";
import { BusApplication } from "../Application/Bus/BusApplication";
import { CoinApplication } from "../Application/Coin/CoinApplication";
import { DatabaseApplication } from "../Application/Database/DatabaseApplication";
import { MinerApplication } from "../Application/Miner/MinerApplication";
import { PusherApplication } from "../Application/Pusher/PusherApplication";

import { Argument } from "./Argument";
import { IApplication } from "./IApplication";

/**
 * Classe principal com o ponto de entrada da execução.
 */
export class Main {
  /**
   * Aplicação selecionada para execução.
   */
  public static get application(): IApplication {
    if (Main.instance !== undefined) {
      throw new InvalidExecutionError(
        "Main cannot be instantiated more than once."
      );
    }

    return (Main.instance = new Main()).application;
  }

  /**
   * Instância única da classe.
   */
  private static instance?: Main;

  /**
   * Nome da seção para o log.
   */
  private static readonly loggerSection = "Main";

  /**
   * Lista de aplicações disponíveis.
   */
  private readonly applications: Array<new () => IApplication> = [
    BotTwitchApplication,
    BusApplication,
    CoinApplication,
    DatabaseApplication,
    MinerApplication,
    PusherApplication,
  ];

  /**
   * Construtor privado.
   */
  private constructor() {}

  /**
   * Instância da aplicação que será executada.
   */
  private get application(): IApplication {
    const applicationName = Argument.getApplicationName();

    const applicationConstructor = this.applications.find(
      (application) => application.name === applicationName
    );

    if (applicationConstructor === undefined) {
      throw new InvalidArgumentError(
        'Invalid application name "{invalidApplicationName}". Enter a name from the list: {applicationsNames}".'.querystring(
          {
            applicationsNames: this.applications
              .map((application) => application.name)
              .join(", "),
            invalidApplicationName: applicationName,
          }
        )
      );
    }

    Logger.post(
      "Selected application to run: {applicationName}",
      { applicationName },
      LogLevel.Information,
      Main.loggerSection
    );

    return new applicationConstructor();
  }
}
