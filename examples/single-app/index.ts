import {Installer, GitHubReleasesService, Octokit} from '@jbrunton/gha-installer'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const octokit = createOctokit()
    const repo = { owner: 'jbrunton', repo: 'gflows' }
    const releasesService = GitHubReleasesService.create(octokit, {
      repo: repo,
      assetName: 'gflows-linux-amd64'
    })
    const installer = Installer.create(releasesService)

    return await installer.installApp({ name: 'gflows', version: core.getInput('version') })
  } catch (error) {
    core.setFailed(error.message)
  }
}

function createOctokit(): Octokit {
  const token = core.getInput('token');
  return github.getOctokit(token);
}

run()
