import {ActionsCore, Environment} from './interfaces'
import {
  Octokit,
  ReposListReleasesItem,
  ReposListReleasesResponseData,
  ReposListReleasesParameters
} from './octokit'
import * as semver from 'semver'
import {AppInfo, describeApp} from './app_info'
import {DownloadInfo, DownloadService} from './download_service'
import * as core from '@actions/core'

interface GitHubReleaseInfo {
  release: ReposListReleasesItem
}

export type GitHubDownloadInfo = DownloadInfo & GitHubReleaseInfo

export type RepoFunction = (app: AppInfo) => ReposListReleasesParameters
export type AssetNameFunction = (app: AppInfo) => string
export type RepoDefinition = ReposListReleasesParameters | RepoFunction
export type AssetNameDefinition = string | AssetNameFunction

export class GitHubReleasesService {
  private _core: ActionsCore
  private _octokit: Octokit
  private _repo: RepoDefinition
  private _assetName: AssetNameDefinition

  constructor(
    core: ActionsCore,
    octokit: Octokit,
    repo: RepoDefinition,
    assetName: AssetNameDefinition
  ) {
    this._core = core
    this._octokit = octokit
    this._repo = repo
    this._assetName = assetName
  }

  async getDownloadInfo(app: AppInfo): Promise<GitHubDownloadInfo> {
    const repo = typeof this._repo == 'object' ? this._repo : this._repo(app)
    const assetName =
      typeof this._assetName == 'string'
        ? this._assetName
        : this._assetName(app)
    const response = await this._octokit.repos.listReleases(repo)
    const releases: ReposListReleasesResponseData = response.data

    if (app.version == 'latest') {
      const release = this.sortReleases(releases)[0]
      this._core.debug(`Using latest version for ${app.name} (${release.name})`)
      return this.getDownloadInfoForAsset(app, assetName, release)
    }

    for (const candidate of releases) {
      if (this.versionsEqual(app.version, candidate.tag_name)) {
        return this.getDownloadInfoForAsset(app, assetName, candidate)
      }
    }

    throw new Error(`Could not find version "${app.version}" for ${app.name}`)
  }

  private versionsEqual(version: string, otherVersion: string): boolean {
    if (version == otherVersion) {
      return true
    }
    const cleanVersion = semver.clean(version)
    if (cleanVersion == null) {
      return false
    }
    return cleanVersion == semver.clean(otherVersion)
  }

  private getDownloadInfoForAsset(
    app: AppInfo,
    assetName: string,
    release: ReposListReleasesItem
  ): GitHubDownloadInfo {
    for (const candidate of release.assets) {
      if (candidate.name == assetName) {
        this._core.debug(
          `Found executable ${assetName} for ${describeApp(app)}`
        )
        return {
          version: release.tag_name,
          url: candidate.browser_download_url,
          release: release
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
      // note: if a tag isn't in semver format, we put it last
      const version1 = semver.clean(release1.tag_name) || '0.0.0'
      const version2 = semver.clean(release2.tag_name) || '0.0.0'
      return semver.rcompare(version1, version2)
    })
  }

  static create(
    octokit: Octokit,
    repo: RepoDefinition,
    assetName: AssetNameDefinition
  ): DownloadService {
    return new GitHubReleasesService(core, octokit, repo, assetName)
  }
}
