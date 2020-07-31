import {ActionsCore, Environment} from './interfaces'
import {
  Octokit,
  ReposListReleasesItem,
  ReposListReleasesResponseData,
  ReposListReleasesParameters
} from './octokit'
import * as semver from 'semver'
import {AppInfo, describeApp} from './app_info'
import {DownloadInfo, DownloadInfoService} from './download_info'
import * as core from '@actions/core'

export class GitHubReleasesService {
  private _core: ActionsCore
  private _octokit: Octokit

  constructor(core: ActionsCore, octokit: Octokit) {
    this._core = core
    this._octokit = octokit
  }

  async getDownloadInfo(app: AppInfo, repo: ReposListReleasesParameters, assetName: string): Promise<DownloadInfo> {
    const response = await this._octokit.repos.listReleases(repo)
    const releases: ReposListReleasesResponseData = response.data

    if (app.version == 'latest') {
      const release = this.sortReleases(releases)[0]
      this._core.debug(`Using latest version for ${app.name} (${release.name})`)
      return this.getDownloadInfoForAsset(app, assetName, release)
    }

    for (const candidate of releases) {
      if (candidate.name == app.version) {
        return this.getDownloadInfoForAsset(app, assetName, candidate)
      }
    }

    throw new Error(`Could not find version "${app.version}" for ${app.name}`)
  }

  private getDownloadInfoForAsset(
    app: AppInfo,
    assetName: string,
    release: ReposListReleasesItem
  ): DownloadInfo {
    for (const candidate of release.assets) {
      if (candidate.name == assetName) {
        this._core.debug(
          `Found executable ${assetName} for ${describeApp(app)}`
        )
        return {
          version: release.name,
          assetName: assetName,
          url: candidate.browser_download_url,
          releaseNotes: release.body
        }
      }
    }
    throw new Error(
      `Could not find executable ${assetName} for ${describeApp(app)}`
    )
  }

  private sortReleases(
    releases: Array<ReposListReleasesItem>
  ): Array<ReposListReleasesItem> {
    return releases.sort((release1, release2) => {
      // note: if a name isn't in semver format (e.g. "0.1.0 - initial release"), we put it last
      const version1 = semver.clean(release1.name) || '0.0.0'
      const version2 = semver.clean(release2.name) || '0.0.0'
      return semver.rcompare(version1, version2)
    })
  }

  static create(octokit: Octokit): DownloadInfoService {
    return new GitHubReleasesService(core, octokit)
  }
}
