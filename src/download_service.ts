import {AppInfo} from './app_info'
import {ActionsCore} from './interfaces'

export interface DownloadInfo<T> {
  version: string
  url: string
  meta: T
}

export type OnFileDownloaded<T> = (
  path: string,
  info: DownloadInfo<T>,
  core: ActionsCore
) => void
export type GetDownloadInfo<T> = (app: AppInfo) => Promise<DownloadInfo<T>>

export interface DownloadService<T> {
  getDownloadInfo: GetDownloadInfo<T>
  onFileDownloaded?: OnFileDownloaded<T>
}
