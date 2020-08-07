# GitHub Actions Installer

[![Build Status](https://github.com/jbrunton/gha-installer/workflows/build/badge.svg?branch=develop)](https://github.com/jbrunton/gha-installer/actions?query=branch%3Adevelop+workflow%3Abuild)
[![Maintainability](https://api.codeclimate.com/v1/badges/3d363eb022777f5a6a1e/maintainability)](https://codeclimate.com/github/jbrunton/gha-installer/maintainability)

Utility classes for creating GitHub actions for downloading and caching binary files.

## Usage

### Single app, single platform

```typescript
import {Installer, GitHubReleasesService, Octokit} from '@jbrunton/gha-installer'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
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

function createOctokit(): Octokit {
  const token = core.getInput('token');
  return github.getOctokit(token);
}

run()
```

### Multi-app, multiplatform

You can configure the installer for multiple apps, or to install different binaries on different platforms. See the [multi-app](https://github.com/jbrunton/gha-installer/tree/develop/examples/multi-app) example.
