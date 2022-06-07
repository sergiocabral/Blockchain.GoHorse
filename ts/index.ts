#! /usr/bin/env node

import { ReloadConfiguration } from './BusMessage/Application/Message/ReloadConfiguration';
import { TerminateApplication } from './BusMessage/Application/Message/TerminateApplication';

import { IApplicationMessage } from './BusMessage/Application/IApplicationMessage';
import { ApplicationMessage } from './BusMessage/Application/ApplicationMessage';

import { ConfigurationReloaded } from './BusMessage/Event/ConfigurationReloaded';

import { Generate } from './Helper/Generate';
import { Get } from './Helper/Get';

import { IInstanceParameters } from './Instance/IInstanceParameters';
import { Instance } from './Instance/Instance';

import { TemplateString } from './Template/TemplateString';
import { TemplateStringCore } from './Template/TemplateStringCore';

import { GlobalDefinition } from './GlobalDefinition';

void new TemplateStringCore();

export {
  ReloadConfiguration,
  TerminateApplication,
  IApplicationMessage,
  ApplicationMessage,
  ConfigurationReloaded,
  Generate,
  Get,
  IInstanceParameters,
  Instance,
  TemplateString,
  TemplateStringCore,
  GlobalDefinition
};
