import { Main } from '@gohorse/npm-application';
import { GenericError, Logger, LogLevel } from '@sergiocabral/helper';
import { BotTwitchApplication } from './Executable/BotTwitchApplication';

Main.start(BotTwitchApplication).catch(error => {
  while (error) {
    if (error instanceof GenericError) {
      Logger.post(error.message, undefined, LogLevel.Fatal);
      error = error.innerError;
    } else {
      throw error;
    }
  }
});
