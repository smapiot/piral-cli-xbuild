import type { BundleResult, PiletBuildHandler } from 'piral-cli';
import { checkExists } from 'piral-cli/utils';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { transformToV2, transformToV3 } from '../formats';
import {
  copyAll,
  getConfig,
  copyFile,
  runAsync,
  setSharedEnvironment,
  watchDir,
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
  skipTransform: boolean;
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
    assertOptionalType(config, 'skipTransform', 'boolean');

    return {
      command: config.command,
      mainFile: config.mainFile,
      outputDir: config.outputDir,
      skipTransform: config.skipTransform || false,
      watchLine: config.watchLine || '',
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
      piralInstances,
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
    process.env.PILET_PIRAL_INSTANCES = JSON.stringify(piralInstances);

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

          const result = {
            name: outFile,
            outDir,
            outFile: `/${outFile}`,
            requireRef,
          };

          const makeBundle = async () => {
            await copyAll(output, outDir);
            await copyFile(outDir, mainFile, outFile);

            if (!config.skipTransform) {
              switch (version) {
                case 'v2':
                  await transformToV2({
                    importmap,
                    name,
                    outDir,
                    outFile,
                    requireRef,
                  });
                  break;
                case 'v3':
                  await transformToV3({
                    importmap,
                    outDir,
                    outFile,
                    requireRef,
                  });
                  break;
              }
            }

            eventEmitter.emit('end', result);
          };

          if (!exists) {
            throw new Error(
              `Could not find file "${mainFile}". Maybe the command "${config.command}" did not run successfully.`,
            );
          }

          watchDir(output, () => {
            eventEmitter.emit('start', {});
            makeBundle();
          });

          await makeBundle();
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
