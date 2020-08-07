const {Installer, GitHubReleasesService} = require('@jbrunton/gha-installer')
const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const octokit = createOctokit()
    const repo = { owner: 'jbrunton', repo: 'gflows' }
    const releasesService = GitHubReleasesService.create(octokit, repo, 'gflows-linux-amd64')
    const installer = Installer.create(releasesService)

    return await installer.installApp({ name: 'gflows', version: core.getInput('version') })
  } catch (error) {
    core.setFailed(error.message)
  }
}

function createOctokit() {
  const token = core.getInput('token');
  return github.getOctokit(token);
}

run()
