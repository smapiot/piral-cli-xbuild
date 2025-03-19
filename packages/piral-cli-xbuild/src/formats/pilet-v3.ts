import type { SharedDependency } from 'piral-cli';
import { transformFileAsync } from '@babel/core';
import { resolve } from 'path';
import { getFiles, readFileAsJson, writeText } from '../helpers';

import bannerPlugin from '../plugins/banner-v3';
import importmapPlugin from '../plugins/importmap';

export interface PiletV3TransformOptions {
  requireRef: string;
  importmap: Array<SharedDependency>;
  outDir: string;
  outFile: string;
}

export async function transformToV3(options: PiletV3TransformOptions) {
  const { outDir, outFile, importmap, requireRef } = options;
  const entryModule = resolve(outFile, outDir);
  const files = await getFiles(outDir);

  await Promise.all(
    files
      .filter((m) => m.endsWith('.js'))
      .map(async (path) => {
        const isEntryModule = path === entryModule;
        const smpath = `${path}.map`;
        const sourceMaps = files.includes(smpath);
        const inputSourceMap = sourceMaps ? await readFileAsJson(smpath) : undefined;
        const plugins = [importmapPlugin(importmap)];

        if (isEntryModule) {
          plugins.push(bannerPlugin(importmap, requireRef, []));
        }

        const { code, map } = await transformFileAsync(path, {
          sourceMaps,
          inputSourceMap,
          comments: isEntryModule,
          plugins,
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'systemjs',
              },
            ],
          ],
        });

        if (map) {
          await writeText(smpath, JSON.stringify(map));
        }

        await writeText(path, code);
      }),
  );
}
