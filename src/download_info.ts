import {AppInfo} from './app_info'

export interface DownloadInfo {
  version: string
  url: string
  assetName: string
  releaseNotes: string
}

export interface DownloadInfoService {
  getDownloadInfo(app: AppInfo): Promise<DownloadInfo>
}
