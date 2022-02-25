import type { BundleResult, PiralBuildHandler } from 'piral-cli';
import { checkExists } from 'piral-cli/utils';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { copyAll, getConfig, moveFile, run, setSharedEnvironment } from '../helpers';

interface ToolConfig {
  command: string;
  outputDir: string;
  mainFile: string;
}

function validateConfig(config: any): ToolConfig {
  if (typeof config.command !== 'string') {
    throw new Error('The "command" property needs to be a string.');
  }

  if (typeof config.outputDir !== 'string') {
    throw new Error('The required "outputDir" property needs to be a string.');
  }

  if (typeof config.mainFile !== 'string') {
    throw new Error('The required "mainFile" property needs to be a string.');
  }

  return {
    command: config.command,
    outputDir: config.outputDir,
    mainFile: config.mainFile,
  };
}

const handler: PiralBuildHandler = {
  async create(options) {
    const {
      root,
      logLevel,
      contentHash,
      emulator,
      entryFiles,
      externals,
      publicUrl,
      sourceMaps,
      minify,
      outDir,
      outFile,
    } = options;

    const eventEmitter = new EventEmitter();
    const config = await getConfig(root, 'piral:build', validateConfig);

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

        await run(config.command, root);

        const output = resolve(root, config.outputDir);
        const mainFile = resolve(output, config.mainFile);

        const exists = await checkExists(mainFile);

        if (!exists) {
          throw new Error(
            `Could not find file "${mainFile}". Maybe the command "${config.command}" did not run successfully.`,
          );
        }

        await copyAll(output, outDir);
        await moveFile(outDir, mainFile, outFile);

        const result = {
          outDir,
          outFile,
        };

        eventEmitter.emit('end', result);

        return result;
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
