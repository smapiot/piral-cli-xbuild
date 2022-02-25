import type { SharedDependency } from 'piral-cli';
import { transformFileAsync } from '@babel/core';
import { resolve } from 'path';
import { getFiles, readFileAsJson, writeText } from './helpers';

export interface PiletTransformOptions {
  name: string;
  requireRef: string;
  importmap: Array<SharedDependency>;
  outDir: string;
  outFile: string;
}

export async function transformToV2(options: PiletTransformOptions) {
  const { outDir, outFile, name, importmap, requireRef } = options;
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
        const plugins: Array<any> = [
          [
            require.resolve('./plugins/importmap'),
            {
              importmap,
            },
          ],
        ];

        if (isEntryModule) {
          plugins.push([
            require.resolve('./plugins/banner'),
            {
              name,
              importmap,
              requireRef,
              cssFiles: [],
            },
          ]);
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
