import AppInfo from './app_info'
import DownloadInfo from './download_info'
import {ActionsCore} from './adapters/core'
import {ActionsToolCache} from './adapters/cache'
import {FileSystem} from './adapters/fs'
import {ReleasesService} from './releases_service'
import * as crypto from 'crypto'
import {Environment} from './adapters/environment'

function describe(app: AppInfo): string {
  return `${app.name} ${app.version}`
}

type OnFileDownloaded = (path: string, info: DownloadInfo, core: ActionsCore) => void

export class Installer {
  private _core: ActionsCore
  private _cache: ActionsToolCache
  private _fs: FileSystem
  private _env: Environment
  private _releasesService: ReleasesService

  constructor(
    core: ActionsCore,
    cache: ActionsToolCache,
    fs: FileSystem,
    env: Environment,
    releasesService: ReleasesService
  ) {
    this._core = core
    this._cache = cache
    this._fs = fs
    this._env = env
    this._releasesService = releasesService
  }

  async installApp(app: AppInfo, onFileDownloaded?: OnFileDownloaded): Promise<void> {
    const downloadInfo = await this._releasesService.getDownloadInfo(app)

    const binName = this._env.platform == 'win32' ? `${app.name}.exe` : app.name

    // note: app.version and downloadInfo.version may be different:
    // if app.version is 'latest' then downloadInfo.version will be the concrete version
    let binPath = this._cache.find(binName, downloadInfo.version)

    if (!binPath) {
      this._core.info(
        `Downloading ${app.name} ${downloadInfo.version} from ${downloadInfo.url}`
      )
      const downloadPath = await this._cache.downloadTool(downloadInfo.url)

      onFileDownloaded?.(downloadPath, downloadInfo, this._core)

      this._fs.chmodSync(downloadPath, '755')
      binPath = await this._cache.cacheFile(
        downloadPath,
        binName,
        binName,
        downloadInfo.version
      )
    } else {
      this._core.info(
        `${app.name} ${downloadInfo.version} already in tool cache`
      )
    }

    this._core.addPath(binPath)
  }

  async installAll(apps: Array<AppInfo>) {
    this._core.info(
      'Installing ' +
        apps.map((app: AppInfo) => `${app.name}:${app.version}`).join(', ')
    )
    await Promise.all(apps.map((app: AppInfo) => this.installApp(app)))
  }
}
