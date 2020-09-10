import {ActionsCore, Environment} from './interfaces'
import {
  Octokit,
  ReposListReleasesItem,
  ReposListReleasesResponseData,
  ReposListReleasesParameters
} from './octokit'
import {AppInfo, describeApp} from './app_info'
import {DownloadInfo, DownloadService} from './download_service'
import * as semver from 'semver'
import * as core from '@actions/core'

export interface GitHubDownloadMeta {
  release: ReposListReleasesItem
}

export type GitHubDownloadInfo = DownloadInfo<GitHubDownloadMeta>

type RepoFunction = (app: AppInfo) => ReposListReleasesParameters
type AssetNameFunction = (platform: string, app: AppInfo) => string
type RepoDefinition = ReposListReleasesParameters | RepoFunction
type AssetNameDefinition = string | AssetNameFunction
export type GitHubReleasesServiceOpts = {
  repo: RepoDefinition
  assetName: AssetNameDefinition
}

export class GitHubReleasesService {
  private _core: ActionsCore
  private _env: Environment
  private _octokit: Octokit
  private _opts: GitHubReleasesServiceOpts

  constructor(
    core: ActionsCore,
    env: Environment,
    octokit: Octokit,
    opts: GitHubReleasesServiceOpts
  ) {
    this._core = core
    this._env = env
    this._octokit = octokit
    this._opts = opts
  }

  async getDownloadInfo(app: AppInfo): Promise<GitHubDownloadInfo> {
    const repo =
      typeof this._opts.repo == 'object'
        ? this._opts.repo
        : this._opts.repo(app)
    const assetName =
      typeof this._opts.assetName == 'string'
        ? this._opts.assetName
        : this._opts.assetName(this._env.platform, app)
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
          meta: {release: release}
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
    return releases
      .filter(release => !release.draft)
      .sort((release1, release2) => {
        // note: if a tag isn't in semver format, we put it last
        const version1 = semver.clean(release1.tag_name) || '0.0.0'
        const version2 = semver.clean(release2.tag_name) || '0.0.0'
        return semver.rcompare(version1, version2)
      })
  }

  static create(
    octokit: Octokit,
    opts: GitHubReleasesServiceOpts
  ): DownloadService<GitHubDownloadMeta> {
    return new GitHubReleasesService(core, process, octokit, opts)
  }
}
