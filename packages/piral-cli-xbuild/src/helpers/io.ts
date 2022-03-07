import { promises as fsPromises } from 'fs';
import { relative, resolve } from 'path';

export function moveFile(dir: string, sourceFile: string, targetFile: string) {
  if (sourceFile !== targetFile) {
    const source = resolve(dir, sourceFile);
    const target = resolve(dir, targetFile);
    return fsPromises.rename(source, target);
  }

  return Promise.resolve();
}

export function copyFile(dir: string, sourceFile: string, targetFile: string) {
  if (sourceFile !== targetFile) {
    const source = resolve(dir, sourceFile);
    const target = resolve(dir, targetFile);
    return fsPromises.copyFile(source, target);
  }

  return Promise.resolve();
}

export async function getFiles(path: string) {
  const files = await fsPromises.readdir(path);
  return files.map((file) => resolve(path, file));
}

export async function readFileAsJson(path: string) {
  const content = await fsPromises.readFile(path, 'utf8');
  return JSON.parse(content);
}

export function writeText(path: string, content: string) {
  return fsPromises.writeFile(path, content, 'utf8');
}

export async function copyAll(sourceFolder: string, targetFolder: string) {
  const sourceFiles = await fsPromises.readdir(sourceFolder);

  await fsPromises.mkdir(targetFolder, { recursive: true });

  await Promise.all(
    sourceFiles.map(async (name) => {
      const sourceFile = resolve(sourceFolder, name);
      const targetFile = resolve(targetFolder, name);
      const stats = await fsPromises.lstat(sourceFile);

      if (stats.isSymbolicLink()) {
        const link = await fsPromises.readlink(sourceFile);
        const absLink = resolve(sourceFolder, link);
        const relLink = relative(sourceFolder, absLink);
        const newLink = resolve(targetFolder, relLink);
        await fsPromises.symlink(newLink, targetFile);
      } else if (stats.isDirectory()) {
        await fsPromises.mkdir(targetFile);
        await copyAll(sourceFile, targetFile);
      } else if (stats.isFile()) {
        await fsPromises.copyFile(sourceFile, targetFile);
      }
    }),
  );
}
