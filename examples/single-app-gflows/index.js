import {Installer, GitHubReleasesService} from '@jbrunton/gha-installer'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
  try {
    const octokit = createOctokit()
    const repo = { owner: 'jbrunton', repo: 'gflows' }
    const releasesService = GitHubReleasesService.create(octokit, repo, 'gflows-linux-amd64')
    const installer = Installer.create(releasesService)

    return await installer.installApp({ name: 'gflows', version: '0.1.0' })
  } catch (error) {
    core.setFailed(error.message)
  }
}

function createOctokit() {
  const token = core.getInput('token');
  return github.getOctokit(token);
}

run()
