# GitHub Actions Installer

Utility classes for creating GitHub actions for downloading and caching binary files.

## Usage

```typescript
import {Installer, GitHubReleasesService, Octokit} from '@jbrunton/gha-installer'
import * as core from '@actions/core'
import * as github from '@actions/github'

function createOctokit(): Octokit {
  const token = core.getInput('token');
  return github.getOctokit(token);
}
  
async function run(): Promise<void> {
  try {
    const octokit = createOctokit()
    const releasesService = GitHubReleasesService.create(octokit)
    const installer = Installer.create(releasesService)

    const repo = { owner: 'k14s', repo: 'ytt' }
    const app = { name: 'ytt', version: '0.28.0' }
    return await installer.installApp(app, repo, 'ytt-linux-amd64')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
```
