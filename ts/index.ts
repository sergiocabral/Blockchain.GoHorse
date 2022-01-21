import { Main } from '@gohorse/npm-application';
import { GenericError, Logger, LogLevel } from '@sergiocabral/helper';
import { BusApplication } from './Executable/BusApplication';

Main.start(BusApplication).catch(error => {
  while (error) {
    if (error instanceof GenericError) {
      Logger.post(error.message, undefined, LogLevel.Fatal);
      error = error.innerError;
    } else {
      throw error;
    }
  }
});
