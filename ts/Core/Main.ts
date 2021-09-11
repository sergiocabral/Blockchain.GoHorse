import { InvalidArgumentError, Logger, LogLevel } from "@sergiocabral/helper";

import { BotTwitchApplication } from "../Application/BotTwitch/BotTwitchApplication";
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
    const selectedApplication = Main.getSelectedApplication();

    if (selectedApplication === undefined) {
      throw new InvalidArgumentError(
        'Invalid application name "{invalidApplicationName}". Enter a name from the list: {applicationsNames}".'.querystring(
          {
            applicationsNames: Main.applications
              .map((application) => application.name)
              .join(", "),
            invalidApplicationName: Main.getSelectedApplicationName(),
          }
        )
      );
    }

    Logger.post(
      "Selected application to run: {applicationName}",
      {
        applicationName: selectedApplication.name,
      },
      LogLevel.Information,
      Main.loggerSection
    );

    return selectedApplication;
  }

  /**
   * Lista de aplicações disponíveis.
   */
  private static readonly applications: IApplication[] = [
    new BotTwitchApplication(),
    new CoinApplication(),
    new DatabaseApplication(),
    new MinerApplication(),
    new PusherApplication(),
  ];

  /**
   * Nome da seção para o log.
   */
  private static readonly loggerSection = Main.name;

  /**
   * Aplicação selecionada para execução.
   */
  private static getSelectedApplication(): IApplication | undefined {
    const applicationName = Main.getSelectedApplicationName();

    return Main.applications.find(
      (application) => application.name === applicationName
    );
  }

  /**
   * Nome da aplicação selecionada para execução.
   */
  private static getSelectedApplicationName(): string {
    const applicationNameArgumentIndex = 2;

    return (process.argv[applicationNameArgumentIndex] ?? "").trim();
  }
}
