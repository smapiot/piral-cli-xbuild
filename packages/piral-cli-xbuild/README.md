[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# [Piral CLI xBuild](https://piral.io) &middot; [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/smapiot/piral-cli-xbuild/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/piral-cli-xbuild.svg?style=flat)](https://www.npmjs.com/package/piral-cli-xbuild) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://jestjs.io) [![Gitter Chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/piral-io/community)

This plugin enables using npm scripts for building and debugging Piral instances & pilets.

## Installation

Use your favorite package manager for the installation (e.g., `npm`):

```sh
npm i piral-cli-xbuild --save-dev
```

**Note**: The plugin has to be installed to tell the `piral-cli` to use `xbuild` as the default bundler.

## Using

Standard commands such as `piral build` or `pilet debug` will now work against shell scripts defined via special sections in the *package.json*.

Environment variables available for all commands:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `PIRAL_ROOT`                       | The root directory where the package.json of the project is.      |
| `PIRAL_LOG_LEVEL`                  | The log level (1-5) set for the piral-cli.                        |
| `PIRAL_TARGET`                     | The directory where the source files of the project are.          |

### `piral build`

Used section in *package.json*: `piral:build`

Example:

```json
{
  "name": "my-piral-instance",
  //...
  "scripts": {
    "build": "piral build"
  },
  "piral:build": {
    "command": "create-react-app",
    "outputDir": "lib"
  }
}
```

Options for running:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `command` (required)               | The command to run to building the Piral instance.                |
| `outputDir` (required)             | The directory where the generated files can be found.             |
| `mainFile` (required)              | The name of the created HTML file (usually *index.html*).         |

Environment variables:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `PIRAL_PUBLIC_URL`                 | The public path of the application.                               |
| `PIRAL_EMULATOR`                   | If the current build is for an emulator package.                  |
| `PIRAL_CONTENT_HASH`               | If a hash should be placed in the file name (`true` or `false`).  |
| `PIRAL_SOURCE_MAPS`                | Indicates of source maps should be used (`true` or `false`).      |
| `PIRAL_MINIFY`                     | Indicates of the code should be minifed (`true` or `false`).      |
| `PIRAL_ENTRY_FILE`                 | The path of the entry file.                                       |
| `PIRAL_EXTERNALS`                  | The comma separated packages that are shared.                     |

### `piral debug`

Used section in *package.json*: `piral:debug`

Example:

```json
{
  "name": "my-piral-instance",
  //...
  "scripts": {
    "start": "piral debug"
  },
  "piral:debug": {
    "command": "create-react-app",
    "outputDir": "lib"
  }
}
```

Options for running:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `command` (required)               | The command to run to building the Piral instance.                |
| `outputDir` (required)             | The directory where the generated files can be found.             |
| `mainFile` (required)              | The name of the created HTML file (usually *index.html*).         |
| `watchLine` (optional)             | If set waits for a certain text to be seen in the command output. |

Environment variables:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `PIRAL_PUBLIC_URL`                 | The public path of the application.                               |
| `PIRAL_EMULATOR`                   | If the current build is for an emulator package.                  |
| `PIRAL_CONTENT_HASH`               | If a hash should be placed in the file name (`true` or `false`).  |
| `PIRAL_SOURCE_MAPS`                | Indicates of source maps should be used (`true` or `false`).      |
| `PIRAL_MINIFY`                     | Indicates of the code should be minifed (`true` or `false`).      |
| `PIRAL_ENTRY_FILE`                 | The path of the entry file.                                       |
| `PIRAL_EXTERNALS`                  | The comma separated packages that are shared.                     |

### `pilet build`

Used section in *package.json*: `pilet:build`

Example:

```json
{
  "name": "my-pilet",
  //...
  "scripts": {
    "build": "pilet build"
  },
  "pilet:build": {
    "command": "create-react-app",
    "outputDir": "lib",
    "mainFile": "index.js"
  }
}
```

Options for running:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `command` (required)               | The command to run to building the pilet.                         |
| `outputDir` (required)             | The directory where the generated files can be found.             |
| `mainFile` (required)              | The name of the created JS file (usually *index.js*).             |
| `skipTransform` (optional)         | If set to `true` assumes that the provided command makes a pilet. |

Making a pilet implies that the pilet is fully valid, e.g., has the format as specified via the `--schema` command line flag. By default, the `pilet build` command will transform the output into a valid pilet.

Environment variables:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `PILET_NAME`                       | The name of the pilet package.                                    |
| `PILET_REQUIRE_REF`                | Contains the require reference for the `window`.                  |
| `PILET_CONTENT_HASH`               | If a hash should be placed in the file name (`true` or `false`).  |
| `PILET_SOURCE_MAPS`                | Indicates of source maps should be used (`true` or `false`).      |
| `PILET_MINIFY`                     | Indicates of the code should be minifed (`true` or `false`).      |
| `PILET_ENTRY_MODULE`               | The path of the entry module.                                     |
| `PILET_EXTERNALS`                  | The comma separated external packages.                            |
| `PILET_IMPORTMAP`                  | The JSON string with the importmap.                               |
| `PILET_SCHEMA`                     | The version of used schema, e.g., `v2`.                           |
| `PILET_PIRAL_INSTANCES`            | The JSON string with the used piral instances.                    |

### `pilet debug`

Used section in *package.json*: `pilet:debug`

Example:

```json
{
  "name": "my-pilet",
  //...
  "scripts": {
    "start": "pilet debug"
  },
  "pilet:debug": {
    "command": "create-react-app",
    "outputDir": "lib",
    "mainFile": "index.js"
  }
}
```

Options for running:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `command` (required)               | The command to run to building the pilet.                         |
| `outputDir` (required)             | The directory where the generated files can be found.             |
| `mainFile` (required)              | The name of the created JS file (usually *index.js*).             |
| `watchLine` (optional)             | If set waits for a certain text to be seen in the command output. |
| `skipTransform` (optional)         | If set to `true` assumes that the provided command makes a pilet. |

Making a pilet implies that the pilet is fully valid, e.g., has the format as specified via the `--schema` command line flag. By default, the `pilet build` command will transform the output into a valid pilet.

Environment variables:

| Name                               | Description                                                       |
| ---------------------------------- | ----------------------------------------------------------------- |
| `PILET_NAME`                       | The name of the pilet package.                                    |
| `PILET_REQUIRE_REF`                | Contains the require reference for the `window`.                  |
| `PILET_CONTENT_HASH`               | If a hash should be placed in the file name (`true` or `false`).  |
| `PILET_SOURCE_MAPS`                | Indicates of source maps should be used (`true` or `false`).      |
| `PILET_MINIFY`                     | Indicates of the code should be minifed (`true` or `false`).      |
| `PILET_ENTRY_MODULE`               | The path of the entry module.                                     |
| `PILET_EXTERNALS`                  | The comma separated external packages.                            |
| `PILET_IMPORTMAP`                  | The JSON string with the importmap.                               |
| `PILET_SCHEMA`                     | The version of used schema, e.g., `v2`.                           |
| `PILET_PIRAL_INSTANCES`            | The JSON string with the used piral instances.                    |

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
