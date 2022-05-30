# @gohorse/npm-log-console

GoHorse is a Git-based blockchain.

[<img src="https://github.com/sergiocabral/App.GoHorse/raw/main/gohorse.png" width="75px;"/>](https://gohorse.dev/)

Library with implementation of displaying log messages in console standard output

```bash
npm install @gohorse/npm-log-console
```

## Creating a new NPM package

Pay attention to these steps when creating an NPM package from this one.

1. Review the file: `./package.json`
   1. Change the name.
   2. Change the description.
   3. Change the homepage.
   4. Will you need to add more packages with `npm install`?
2. Review the file: `./README.md`
   1. Change the title.
   1. Change the description under the GoHorse logo.
   2. Adjust package name in `npm install` command.
   3. Remove the topic *"Creating a new NPM package"*.
   4. Adjust the Author topic if necessary.
   5. Need to add new topics with information about this new package?
3. Review the file: `./.npmrc`
   1. Adjust the prefix used to create `git tag`.
4. Remove directory: `./ts/Dummy`
   1. And don't forget to add your source code directories and files.
5. Review this file: `./ts/index.ts`
   1. Removes the invalid source code snippet.
   2. If you are creating...
      1. a library, make available the classes, interfaces, etc. in `export`.
      2. an application, implement the execution and don't forget to make it possible to shut down with the `/stop` argument.

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
