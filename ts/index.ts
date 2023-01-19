#! /usr/bin/env node

import { ApplicationConfiguration } from './Application/Configuration/ApplicationConfiguration';
import { ApplicationDatabaseConfiguration } from './Application/Configuration/ApplicationDatabaseConfiguration';
import { ApplicationLoggerCollectionConfiguration } from './Application/Configuration/ApplicationLoggerCollectionConfiguration';
import { EncryptThisJsonConfiguration } from './Application/Configuration/EncryptThisJsonConfiguration';

import { ApplicationExecutionMode } from './Application/Type/ApplicationExecutionMode';
import { ApplicationState } from './Application/Type/ApplicationState';
import { IApplication } from './Application/Type/IApplication';
import { IApplicationParameters } from './Application/Type/IApplicationParameters';

import { Application } from './Application/Application';
import { ApplicationDatabase } from './Application/ApplicationDatabase';
import { ApplicationFlagFileMessageRouter } from './Application/ApplicationFlagFileMessageRouter';
import { ApplicationLogger } from './Application/ApplicationLogger';
import { ApplicationParameters } from './Application/ApplicationParameters';
import { ApplicationTemplateString } from './Application/ApplicationTemplateString';

import { SampleApp } from './Sample/SampleApp';
import { SampleAppConfiguration } from './Sample/SampleAppConfiguration';

const commandLine = process.argv.join(' ');
if (commandLine.includes(ApplicationParameters.packageName)) {
  void new SampleApp().run();
}

export {
  ApplicationConfiguration,
  ApplicationDatabaseConfiguration,
  ApplicationLoggerCollectionConfiguration,
  EncryptThisJsonConfiguration,
  ApplicationExecutionMode,
  ApplicationState,
  IApplication,
  IApplicationParameters,
  Application,
  ApplicationDatabase,
  ApplicationFlagFileMessageRouter,
  ApplicationLogger,
  ApplicationParameters,
  ApplicationTemplateString,
  SampleApp,
  SampleAppConfiguration
};
