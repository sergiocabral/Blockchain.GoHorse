import { GenericError, Logger, LogLevel } from "@sergiocabral/helper";

import { Main } from "./Core/Main";

try {
  Main.application.run();
} catch (error: unknown) {
  while (error) {
    if (error instanceof GenericError) {
      Logger.post(error.message, undefined, LogLevel.Fatal);
      error = error.innerError;
    } else {
      throw error;
    }
  }
}
