# @gohorse/npm-core

GoHorse is a Git-based blockchain.

[<img src="https://github.com/sergiocabral/App.GoHorse/raw/main/gohorse.png" width="75px;"/>](https://gohorse.dev/)

Base library with general functionality for the other parts of the system.

```bash
npm install @gohorse/npm-core
```

## Logger variables

Convention for naming values associated with log messages.

- `url` : Endereço de internet contendo um protocolo como http, ftp, ws, etc.
- `path` : Disk path to files or directories.
- `filePath` : Disk path to files.
- `directoryPath` : Disk path to directories.

Don't use `id`, `type`, `name`, etc. But describe it more fully as:

- `instanceId`
- `toInstanceId`
- `fromInstanceId`
- `applicationName`
- `applicationVersion`
- `applicationExecutionMode`
- `applicationMessageId`
- `applicationMessageType`
- `languageCultureName`
- `className`
- `authenticationMode`

Use "Content" suffix for text content:

- `jsonContent`
- `fileLineContent`
- `commandLineContent`
- `errorContent` : Stacktrace or similar error information. 

Use "List" suffix for listings:

- `applicationIdList`
- `keyList`

Values with units:

- `timeSeconds`
- `timeMilliSeconds`

Other names used:

- `error` : Error message formatted with `HelperText.formatError()`.
- `invalidValue` : Any invalid value.
- `count` : Any quantitative value.
- `enabled` : Signaling enabled and disabled.
- `logLevel` : Logging level.
- `httpStatusCode` : Código de status HTTP.

## NPM Commands

In the package.json file you have configured the following commands:

```bash
# Rewrites TypeScript, JavaScript and tests code with formatting.
npm run format

# Finds in TypeScript files not recommended coding practices.
npm run lint

# The same as the previous two executed one after the other.
npm run format+lint

# Run the unit tests.
npm run test

# Compiles TypeScript code to JavaScript.
npm run build

# Executes the last five commands.
npm run build:prod

# If the package is an application it is expected that
# it can be started in this way.
npm run start

# If the package is an application it is expected that
# any running instance of it can be terminated in this way.
npm run stop

# Runs after initial installation with `npm install`
# and before publishing with `npm publish`
# Confirm that compiling files with `npm run build`
# is working before publishing.
npm run prepare

# Executes during versioning, but before it becomes effective,
# with `npm version patch` or `npm version minor` or npm `version major`.
# Run the `npm run build:prod` and after add with `git add` all new
# or modified files in the `./ts` directory to be included in the
# versioning commit.
npm run version

# Executed after versioning the package with `npm version patch`
# or `npm version minor` or npm `version major`
# After NPM inserts the version commit and tag, this command
# pushes to the remote repository using `git push && git push --tags`
npm run postversion

```

## Author

| [<img src="https://avatars.githubusercontent.com/u/665373?v=4" width="75px;"/>](https://github.com/sergiocabral) |
| :-: |
|[sergiocabral.com](https://sergiocabral.com)|
