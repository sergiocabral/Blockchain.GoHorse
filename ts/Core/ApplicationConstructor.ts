import { Application } from './Application';
import { ResultEvent } from '@sergiocabral/helper';

/**
 * Construtor de Application.
 */
export type ApplicationConstructor = new (
  onFinished: ResultEvent
) => Application;
