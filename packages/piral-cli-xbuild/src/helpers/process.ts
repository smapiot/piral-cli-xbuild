import * as chalk from 'chalk';
import { ChildProcess, exec } from 'child_process';

const timeoutInSeconds = 45;
const color = new chalk.Instance({ level: 1 });

function noop() {}

export interface RunningProcess {
  waitEnd(): Promise<void>;
  waitUntil(condition: string, error?: string): Promise<void>;
  end(): void;
}

function forwardOutput(cp: ChildProcess, cmd: string, onLine: (line: string) => void = noop) {
  const onError = (data: Buffer) => {
    const line = data.toString();

    console.log(`[${cmd}] ${color.red(line)}`);

    onLine(line);
  };

  const onData = (data: Buffer) => {
    const line = data.toString();

    console.log(`[${cmd}] ${color.blueBright(line)}`);

    onLine(line);
  };

  cp.stdout.on('data', onData);
  cp.stderr.on('data', onError);

  return () => {
    cp.stdout.destroy();
    cp.stderr.destroy();
  };
}

export function run(cmd: string, cwd = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    const ref = { dispose: noop };
    const cp = exec(cmd, { cwd }, (err, result) => {
      if (err) {
        ref.dispose();
        reject(err);
      } else {
        ref.dispose();
        resolve(result.trim());
      }
    });

    ref.dispose = forwardOutput(cp, cmd);
  });
}

export function runAsync(cmd: string, cwd = process.cwd()): RunningProcess {
  const waiters: Array<(line: string) => void> = [];
  const cp = exec(cmd, { cwd });
  const dispose = forwardOutput(cp, cmd, (line) => {
    waiters.forEach((waiter) => waiter(line));
  });

  return {
    waitEnd() {
      return new Promise<void>((resolve, reject) => {
        cp.on('error', reject);
        cp.on('exit', resolve);
        cp.on('close', resolve);
      });
    },
    waitUntil(condition, error) {
      return new Promise<void>((resolve, reject) => {
        const ref = { timeout: undefined, cleanup: noop };
        const waiter = (line: string) => {
          if (line.includes(condition)) {
            ref.cleanup();
            resolve();
          } else if (error && line.includes(error)) {
            ref.cleanup();
            reject(new Error(`Process encountered an error: ${line}`));
          }
        };
        ref.cleanup = () => {
          waiters.splice(waiters.indexOf(waiter), 1);
          clearTimeout(ref.timeout);
        };
        waiters.push(waiter);
        ref.timeout = setTimeout(() => {
          ref.cleanup();
          reject(new Error(`Process not started after ${timeoutInSeconds}s`));
        }, timeoutInSeconds * 1000);
      });
    },
    end() {
      cp.kill('SIGTERM');
      dispose();
    },
  };
}
