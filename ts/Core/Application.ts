import {
  Configuration,
  InvalidArgumentError,
  IOError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";
import fs from "fs";
import path from "path";

import { Argument } from "./Argument";
import { IApplication } from "./IApplication";

/**
 * Classe base para uma aplicação.
 */
export abstract class Application<TConfiguration extends Configuration>
  implements IApplication
{
  /**
   * Configurações.
   */
  private configurationValue?: TConfiguration;

  /**
   * Configurações.
   */
  public get configuration(): TConfiguration {
    return (
      this.configurationValue ??
      (this.configurationValue = this.loadConfiguration())
    );
  }

  /**
   * Tipo da configuração;
   */
  protected abstract get configurationType(): new (
    json?: unknown
  ) => TConfiguration;

  /**
   * Executa a aplicação.
   */
  public abstract run(): void;

  /**
   * Configurações JSON
   */
  private loadConfiguration(): TConfiguration {
    let configuration: TConfiguration;

    const environmentFile =
      Argument.getEnvironmentFile() ||
      `env.${this.configurationType.name}.json`;
    const environmentFilePath = path.resolve(".", environmentFile);

    if (!fs.existsSync(environmentFilePath)) {
      configuration = new this.configurationType();

      try {
        fs.writeFileSync(
          environmentFilePath,
          JSON.stringify(configuration, undefined, "  ")
        );
      } catch (error: unknown) {
        throw new IOError(
          "Cannot create default configuration file: {environmentFilePath}".querystring(
            {
              environmentFilePath,
            }
          ),
          error
        );
      }

      Logger.post(
        "The configuration file does not exists for {applicationName}. Created with default values: {environmentFilePath}",
        {
          applicationName: this.constructor.name,
          environmentFilePath,
        },
        LogLevel.Warning
      );
    } else {
      let environmentFileContent: string;

      try {
        environmentFileContent = fs
          .readFileSync(environmentFilePath)
          .toString();
      } catch (error: unknown) {
        throw new IOError(
          "Cannot read configuration file: {environmentFilePath}".querystring({
            environmentFilePath,
          }),
          error
        );
      }

      let environmentFileContentAsJson: unknown;
      try {
        environmentFileContentAsJson = JSON.parse(environmentFileContent);
      } catch (error: unknown) {
        throw new IOError(
          "Cannot parse configuration file: {environmentFilePath}".querystring({
            environmentFilePath,
          }),
          error
        );
      }

      configuration = new this.configurationType(environmentFileContentAsJson);
    }

    const errors = configuration.errors();
    if (errors.length) {
      throw new InvalidArgumentError(
        "Invalid JSON for {className}:\n{errors}".querystring({
          className: this.constructor.name,
          errors: errors.map((error) => `- ${error}`).join("\n"),
        })
      );
    }

    return configuration;
  }
}
