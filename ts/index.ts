#! /usr/bin/env node

import { SampleApp } from './Sample/SampleApp';

// TODO: Implementar log para elasticsearch
// TODO: Criar packages npm-log, npm-log-console, npm-log-file, npm-log-elasticsearch
// TODO: Mover MessageBetweenInstances para npm-core

void new SampleApp().run();
