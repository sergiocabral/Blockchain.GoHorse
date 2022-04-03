import { Application } from './Application';

/**
 * Construtor de Application.
 */
export type ApplicationConstructor = new (
  onFinished: (error: unknown | undefined) => void
) => Application;
