# GitHub Actions Installer

[![Build Status](https://github.com/jbrunton/gha-installer/workflows/build/badge.svg?branch=develop)](https://github.com/jbrunton/gha-installer/actions?query=branch%3Adevelop+workflow%3Abuild)
[![Maintainability](https://api.codeclimate.com/v1/badges/3d363eb022777f5a6a1e/maintainability)](https://codeclimate.com/github/jbrunton/gha-installer/maintainability)

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
