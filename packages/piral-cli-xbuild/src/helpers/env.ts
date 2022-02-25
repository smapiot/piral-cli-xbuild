import type { LogLevels } from 'piral-cli';

export function setSharedEnvironment(root: string, logLevel: LogLevels, targetDir: string) {
  process.env.PIRAL_ROOT = root;
  process.env.PIRAL_LOG_LEVEL = logLevel.toString();
  process.env.PIRAL_TARGET = targetDir;
}
