import * as core from '@actions/core'
import * as fs from 'fs'

export interface ActionsToolCache {
  find(toolName: string, versionSpec: string, arch?: string): string;
  downloadTool(url: string, dest?: string, auth?: string): Promise<string>;
  cacheFile(sourceFile: string, targetFile: string, tool: string, version: string, arch?: string): Promise<string>;
}

export interface ActionsCore {
  getInput(name: string, options?: core.InputOptions): string
  debug(message: string): void;
  info(message: string | Error): void
  warning(message: string | Error): void;
  addPath(inputPath: string): void;
}

export interface Environment {
  platform: string
}

export interface FileSystem {
  chmodSync(path: fs.PathLike, mode: fs.Mode): void;
  readFileSync(path: fs.PathLike | number, options?: { encoding?: null; flag?: string; } | null): Buffer;
}
