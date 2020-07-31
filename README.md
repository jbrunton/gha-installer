# GitHub Actions Installer

Utility classes for creating GitHub actions for downloading and caching binary files.

## Usage

```typescript
import {Installer, GitHubReleasesService, Octokit} from 'gha-installer'
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
    return await installer.installApp({ name: 'ytt', version: '0.28.0' })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
```
