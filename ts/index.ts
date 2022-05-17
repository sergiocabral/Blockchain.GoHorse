#! /usr/bin/env node

import { SampleApp } from './Sample/SampleApp';

// TODO: Implementar comunicação entre instancias na mesma máquina
// TODO: Tornar possível recarregar configurações sem fechar aplicação.
// TODO: Implementar log para elasticsearch

void new SampleApp().run();
