import type { SharedDependency } from 'piral-cli';
import type { PluginObj } from '@babel/core';
import type { Statement } from '@babel/types';
import template from '@babel/template';

export default function babelPlugin(
  importmap: Array<SharedDependency>,
  requireRef: string,
  cssFiles: Array<string>,
): PluginObj {
  return {
    visitor: {
      Program(path) {
        const deps = importmap.reduce((obj, dep) => {
          obj[dep.id] = dep.ref;
          return obj;
        }, {});

        path.addComment('leading', `@pilet v:3(${requireRef},${JSON.stringify(deps)})`, true);

        if (cssFiles.length > 0) {
          path.node.body.push(template.ast(`export const styles = ${JSON.stringify(cssFiles)};`) as Statement);
        }
      },
    },
  };
}
