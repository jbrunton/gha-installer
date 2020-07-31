import {AppInfo} from './app_info'
import {ActionsCore} from './interfaces'

export interface DownloadInfo {
  version: string
  url: string
}

export type OnFileDownloaded = (
  path: string,
  info: DownloadInfo,
  core: ActionsCore
) => void
export type GetDownloadInfo = (app: AppInfo) => Promise<DownloadInfo>

export interface DownloadService {
  getDownloadInfo: GetDownloadInfo
  onFileDownloaded?: OnFileDownloaded
}
