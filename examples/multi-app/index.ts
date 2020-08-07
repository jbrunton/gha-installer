import {
  Installer,
  GitHubReleasesService,
  Octokit,
  AppInfo,
  ReposListReleasesParameters
} from '@jbrunton/gha-installer'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
  try {
    const octokit = createOctokit()
    const releasesService = GitHubReleasesService.create(octokit, {
      repo: getRepo,
      assetName: getAssetName
    })
    const installer = Installer.create(releasesService)

    return await installer.installAll(getAppsToDownload())
  } catch (error) {
    core.setFailed(error.message)
  }
}

function createOctokit(): Octokit {
  const token = core.getInput('token');
  return github.getOctokit(token);
}

function getRepo(app): ReposListReleasesParameters {
  return { owner: 'k14s', repo: app.name }
}

function getAssetName(platform, app): string {
  switch (platform) {
    case 'win32': return `${app.name}-windows-amd64.exe`
    case 'darwin': return `${app.name}-darwin-amd64`
    default: return `${app.name}-linux-amd64`
  }
}

function getAppsToDownload(): Array<AppInfo> {
  const k14sApps = ['ytt', 'kbld', 'kapp', 'kwt', 'imgpkg', 'vendir']
  return k14sApps.map(app => {
    return { name: app, version: core.getInput(app) }
  })
}

run()
