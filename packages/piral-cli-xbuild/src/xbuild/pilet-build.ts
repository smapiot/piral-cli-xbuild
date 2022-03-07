import type { BundleResult, PiletBuildHandler } from 'piral-cli';
import { checkExists } from 'piral-cli/utils';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { transformToV2 } from '../pilet-v2';
import { copyAll, getConfig, copyFile, setSharedEnvironment, run, assertRequiredType, assertOptionalType } from '../helpers';

interface ToolConfig {
  command: string;
  outputDir: string;
  mainFile: string;
  skipTransform: boolean;
}

function validateConfig(config: any): ToolConfig {
  assertRequiredType(config, 'command', 'string');
  assertRequiredType(config, 'outputDir', 'string');
  assertRequiredType(config, 'mainFile', 'string');
  assertOptionalType(config, 'skipTransform', 'boolean');

  return {
    command: config.command,
    mainFile: config.mainFile,
    outputDir: config.outputDir,
    skipTransform: config.skipTransform || false,
  };
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
    const config = await getConfig(root, 'pilet:build', validateConfig);

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
        await copyFile(outDir, mainFile, outFile);

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
          name,
          outDir,
          outFile,
          requireRef,
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
