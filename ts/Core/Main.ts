import {
  InvalidArgumentError,
  InvalidExecutionError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";
import fs from "fs";

import { BlockchainApplication } from "../Application/Blockchain/BlockchainApplication";
import { BotTwitchApplication } from "../Application/BotTwitch/BotTwitchApplication";
import { BusApplication } from "../Application/Bus/BusApplication";
import { CoinApplication } from "../Application/Coin/CoinApplication";
import { DatabaseApplication } from "../Application/Database/DatabaseApplication";
import { MinerApplication } from "../Application/Miner/MinerApplication";
import { Definition } from "../Definition";

import { Argument } from "./Argument";
import { IApplication } from "./IApplication";

/**
 * Classe principal com o ponto de entrada da execução.
 */
export class Main {
  /**
   * Aplicação selecionada para execução.
   */
  public static async start(): Promise<void> {
    if (Main.instance !== undefined) {
      throw new InvalidExecutionError(
        "Main cannot be instantiated more than once."
      );
    }

    const main = (Main.instance = new Main());
    const application = main.getApplication();

    const killFilename = `KILL.${Argument.getApplicationName()}`;
    if (fs.existsSync(killFilename)) {
      fs.unlinkSync(killFilename);
    }

    if (!Argument.hasStopArgument()) {
      await application.run();

      const killVerifyIntervalTimer = setInterval(async () => {
        if (fs.existsSync(killFilename)) {
          fs.unlinkSync(killFilename);

          Logger.post(
            "Signal received to terminate application.",
            undefined,
            LogLevel.Information,
            Main.name
          );

          await application.stop();

          clearInterval(killVerifyIntervalTimer);
        }
      }, Definition.INTERVAL_BETWEEN_CHECKING_FLAG_FILE);

      application.onStop.add(() => clearInterval(killVerifyIntervalTimer));
    } else {
      Logger.post(
        "Sending signal to terminate application.",
        undefined,
        LogLevel.Information,
        Main.name
      );

      fs.writeFileSync(killFilename, "");
    }
  }

  /**
   * Instância única da classe.
   */
  private static instance?: Main;

  /**
   * Lista de aplicações disponíveis.
   */
  private readonly applications: Array<new () => IApplication> = [
    BlockchainApplication,
    BotTwitchApplication,
    BusApplication,
    CoinApplication,
    DatabaseApplication,
    MinerApplication,
  ];

  /**
   * Construtor privado.
   */
  private constructor() {}

  /**
   * Instância da aplicação que será executada.
   */
  private getApplication(): IApplication {
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
      "Selected application: {applicationName}",
      { applicationName },
      LogLevel.Information,
      Main.name
    );

    return new applicationConstructor();
  }
}
