#! /usr/bin/env node

import { Main } from './Core/Main';
import { SampleApp } from './Sample/SampleApp';

// TODO: Implementar log com dados fixos no contexto.
// TODO: Implementar log para arquivo
// TODO: Implementar log para elasticsearch

new Main(SampleApp);
