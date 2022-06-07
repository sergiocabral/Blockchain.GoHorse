#! /usr/bin/env node

import { SampleApp } from './Sample/SampleApp';

// TODO: Revisar informação do log para remover dados privados do usuário, por exemplo o path dos arquivos de tradução.
// TODO: Rever necessidade de Logger em toda aplicação e pacotes npm-*

void new SampleApp().run();
