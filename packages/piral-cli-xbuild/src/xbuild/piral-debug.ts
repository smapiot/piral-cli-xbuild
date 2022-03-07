import type { BundleResult, PiralBuildHandler } from 'piral-cli';
import { checkExists } from 'piral-cli/utils';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import {
  copyAll,
  getConfig,
  copyFile,
  runAsync,
  setSharedEnvironment,
  assertRequiredType,
  assertOptionalType,
} from '../helpers';

type ToolConfig = BaseToolConfig & (WatchToolConfig | UrlToolConfig);

interface BaseToolConfig {
  command: string;
  watchLine: string;
}

interface UrlToolConfig {
  url: string;
  type: 'url';
}

interface WatchToolConfig {
  outputDir: string;
  mainFile: string;
  type: 'watch';
}

function validateConfig(config: any): ToolConfig {
  assertRequiredType(config, 'command', 'string');
  assertOptionalType(config, 'watchLine', 'string');

  if (typeof config.url !== 'undefined') {
    assertRequiredType(config, 'url', 'string');

    return {
      command: config.command,
      url: config.url,
      watchLine: config.watchLine || '',
      type: 'url',
    };
  } else {
    assertRequiredType(config, 'outputDir', 'string');
    assertRequiredType(config, 'mainFile', 'string');

    return {
      command: config.command,
      mainFile: config.mainFile,
      outputDir: config.outputDir,
      watchLine: config.watchLine || '',
      type: 'watch',
    };
  }
}

const handler: PiralBuildHandler = {
  async create(options) {
    const {
      root,
      logLevel,
      publicUrl,
      emulator,
      contentHash,
      sourceMaps,
      minify,
      entryFiles,
      externals,
      outDir,
      outFile,
    } = options;

    const eventEmitter = new EventEmitter();
    const config = await getConfig(root, 'piral:debug', validateConfig);

    setSharedEnvironment(root, logLevel, process.cwd());

    process.env.PIRAL_PUBLIC_URL = publicUrl;
    process.env.PIRAL_EMULATOR = emulator.toString();
    process.env.PIRAL_CONTENT_HASH = contentHash.toString();
    process.env.PIRAL_SOURCE_MAPS = sourceMaps.toString();
    process.env.PIRAL_MINIFY = minify.toString();
    process.env.PIRAL_ENTRY_FILE = entryFiles;
    process.env.PIRAL_EXTERNALS = externals.join(',');

    return {
      async bundle() {
        eventEmitter.emit('start', {});

        const proc = runAsync(config.command, root);

        if (config.watchLine) {
          await proc.waitUntil(config.watchLine);
        }

        if (config.type === 'watch') {
          const output = resolve(root, config.outputDir);
          const mainFile = resolve(output, config.mainFile);
          const exists = await checkExists(mainFile);

          if (!exists) {
            throw new Error(
              `Could not find file "${mainFile}". Maybe the command "${config.command}" did not run successfully.`,
            );
          }

          await copyAll(output, outDir);
          await copyFile(outDir, mainFile, outFile);

          const result = {
            outDir,
            outFile,
          };

          eventEmitter.emit('end', result);

          return result;
        } else {
          const url = config.url;

          //TODO check / query for URL --> status "200"

          const result = {
            url,
          };

          eventEmitter.emit('end', {
            url,
          });
        }
      },
      onEnd(cb: (result: BundleResult) => void) {
        eventEmitter.on('end', cb);
      },
      onStart(cb: () => void) {
        eventEmitter.on('start', cb);
      },
    };
  },
};

export const create = handler.create;
