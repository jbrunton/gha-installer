import AppInfo from './app_info'
import DownloadInfo from './download_info'

export default interface ReleasesService {
  getDownloadInfo(app: AppInfo): Promise<DownloadInfo>
}
