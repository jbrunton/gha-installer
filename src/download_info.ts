import {AppInfo} from './app_info'
import {ReposListReleasesParameters} from './octokit'

export interface DownloadInfo {
  version: string
  url: string
  assetName: string
  releaseNotes: string
}

export interface DownloadInfoService {
  getDownloadInfo(
    app: AppInfo,
    repo: ReposListReleasesParameters,
    assetName: String
  ): Promise<DownloadInfo>
}
