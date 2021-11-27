import {
  InvalidArgumentError,
  IOError,
  Logger,
  LogLevel,
} from "@sergiocabral/helper";
import fs from "fs";
import path from "path";
import sha1 from "sha1";

import { Argument } from "../Argument";
import { Translation } from "../Translation/Translation";

import { ApplicationConfiguration } from "./ApplicationConfiguration";
import { IApplication } from "./IApplication";

/**
 * Classe base para uma aplicação.
 */
export abstract class Application<
  TConfiguration extends ApplicationConfiguration
> implements IApplication
{
  /**
   * Evento quando a aplicação for finalizada.
   */
  public readonly onStop: Set<() => Promise<void>> = new Set<
    () => Promise<void>
  >();

  /**
   * Identificador da aplicação por execução.
   */
  protected readonly id: string = sha1(Math.random().toString());

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
  public async run(): Promise<void> {
    await Translation.load(this.configuration.language);
    await this.doRun();
  }

  /**
   * Finaliza a aplicação.
   */
  public async stop(): Promise<void> {
    for (const onStop of this.onStop) {
      await onStop();
    }

    await this.doStop();
  }

  /**
   * Implementação da execução da aplicação.
   */
  protected abstract doRun(): Promise<void>;

  /**
   * Implementação da finalização da aplicação.
   */
  protected abstract doStop(): Promise<void>;

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

      configuration = new this.configurationType(
        environmentFileContentAsJson
      ).initialize();

      try {
        fs.writeFileSync(
          environmentFilePath,
          JSON.stringify(configuration, undefined, "  ")
        );
      } catch (error: unknown) {
        throw new IOError(
          "Cannot update configuration file: {environmentFilePath}".querystring(
            {
              environmentFilePath,
            }
          ),
          error
        );
      }
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
