import type { BundleResult, PiletBuildHandler } from 'piral-cli';
import { checkExists } from 'piral-cli/utils';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { transformToV2 } from '../pilet-v2';
import { copyAll, getConfig, moveFile, runAsync, setSharedEnvironment } from '../helpers';

type ToolConfig = BaseToolConfig & (WatchToolConfig | UrlToolConfig);

interface BaseToolConfig {
  command: string;
}

interface UrlToolConfig {
  url: string;
  type: 'url';
}

interface WatchToolConfig {
  outputDir: string;
  mainFile: string;
  type: 'watch';
  skipTransform: boolean;
}

function validateConfig(config: any): ToolConfig {
  if (typeof config.command !== 'string') {
    throw new Error('The required "command" property needs to be a string.');
  }

  if (typeof config.url !== 'undefined') {
    if (typeof config.url !== 'string') {
      throw new Error('The required "url" property needs to be a string.');
    }

    return {
      command: config.command,
      url: config.url,
      type: 'url',
    };
  } else {
    if (typeof config.outputDir !== 'string') {
      throw new Error('The required "outputDir" property needs to be a string.');
    }

    if (typeof config.mainFile !== 'string') {
      throw new Error('The required "mainFile" property needs to be a string.');
    }

    if (config.skipTransform !== undefined && typeof config.skipTransform !== 'boolean') {
      throw new Error('The optional "skipTransform" property needs to be a boolean.');
    }

    return {
      command: config.command,
      mainFile: config.mainFile,
      outputDir: config.outputDir,
      skipTransform: config.skipTransform || false,
      type: 'watch',
    };
  }
}

const handler: PiletBuildHandler = {
  async create(options) {
    const {
      root,
      contentHash,
      entryModule,
      externals,
      importmap,
      logLevel,
      minify,
      outDir,
      outFile,
      piral,
      sourceMaps,
      targetDir,
      version,
    } = options;

    const eventEmitter = new EventEmitter();
    const name = process.env.BUILD_PCKG_NAME;
    const shortName = name.replace(/\W/gi, '');
    const requireRef = `xChunkpr_${shortName}`;
    const config = await getConfig(root, 'pilet:debug', validateConfig);

    setSharedEnvironment(root, logLevel, targetDir);

    process.env.PILET_NAME = name;
    process.env.PILET_REQUIRE_REF = requireRef;
    process.env.PILET_CONTENT_HASH = contentHash.toString();
    process.env.PILET_SOURCE_MAPS = sourceMaps.toString();
    process.env.PILET_MINIFY = minify.toString();
    process.env.PILET_ENTRY_MODULE = entryModule;
    process.env.PILET_EXTERNALS = externals.join(',');
    process.env.PILET_IMPORTMAP = JSON.stringify(importmap);
    process.env.PILET_SCHEMA = version;
    process.env.PILET_PIRAL_INSTANCE = piral;

    return {
      async bundle() {
        eventEmitter.emit('start', {});

        const proc = runAsync(config.command, root);

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
          await moveFile(outDir, mainFile, outFile);

          if (!config.skipTransform) {
            await transformToV2({
              importmap,
              name,
              outDir,
              outFile,
              requireRef,
            });
          }

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
          }

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
