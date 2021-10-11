import { GenericError, Logger, LogLevel } from "@sergiocabral/helper";

import { Main } from "./Core/Main";

Main.start().catch((error) => {
  while (error) {
    if (error instanceof GenericError) {
      Logger.post(error.message, undefined, LogLevel.Fatal);
      error = error.innerError;
    } else {
      throw error;
    }
  }
});
